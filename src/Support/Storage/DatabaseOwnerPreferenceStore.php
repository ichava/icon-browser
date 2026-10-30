<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support\Storage;

use Throwable;
use JsonException;
use Illuminate\Database\Connection;
use Illuminate\Support\Facades\Date;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\ConnectionInterface;
use Simtabi\Laranail\Ichava\Data\PreferenceOwner;
use Illuminate\Database\ConnectionResolverInterface;
use Simtabi\Laranail\Ichava\Contracts\PreferenceStore;
use Simtabi\Laranail\Ichava\Contracts\OwnerPreferenceStore;

/**
 * Core's `OwnerPreferenceStore`, kept in `ichava_owner_preferences`.
 *
 * Bound by this package, so core's owner-aware store sends a signed-in user's
 * favourites, collections, history and preferences here and keeps the session
 * store for guests; core's login listener merges a guest's session data into
 * the owner's rows on sign-in. That is what makes the library follow the user
 * across devices.
 *
 * Until the migration has run, the store answers as the session store does,
 * so a host that has not migrated keeps exactly the behaviour it had before
 * this store existed instead of losing a signed-in user's writes.
 */
final class DatabaseOwnerPreferenceStore implements OwnerPreferenceStore
{
    public const string TABLE = 'ichava_owner_preferences';

    /** Whether the table exists, decided once per instance family. */
    private ?bool $tableExists;

    public function __construct(
        private readonly ConnectionResolverInterface $connections,
        private readonly PreferenceStore $fallback,
        private readonly ?PreferenceOwner $scope = null,
        ?bool $tableExists = null,
    ) {
        $this->tableExists = $tableExists;
    }

    public function forOwner(PreferenceOwner $owner): static
    {
        return new self($this->connections, $this->fallback, $owner, $this->tableExists());
    }

    public function owner(): ?PreferenceOwner
    {
        return $this->scope;
    }

    public function put(string $key, mixed $value): bool
    {
        if (! $this->usable()) {
            return $this->fallback->put($key, $value);
        }

        try {
            $now = Date::now();

            $this->rows()->upsert([[
                ...$this->ownerColumns(),
                'key'        => $key,
                'value'      => json_encode($value, JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]], ['owner_type', 'owner_id', 'key'], ['value', 'updated_at']);

            return true;
        } catch (JsonException) {
            return false;
        }
    }

    public function get(string $key, mixed $default = null): mixed
    {
        if (! $this->usable()) {
            return $this->fallback->get($key, $default);
        }

        $value = $this->owned()->where('key', $key)->value('value');

        return is_string($value) ? self::decode($value, $default) : $default;
    }

    public function has(string $key): bool
    {
        if (! $this->usable()) {
            return $this->fallback->has($key);
        }

        return $this->owned()->where('key', $key)->exists();
    }

    public function forget(string $key): bool
    {
        if (! $this->usable()) {
            return $this->fallback->forget($key);
        }

        $this->owned()->where('key', $key)->delete();

        return true;
    }

    /** @return array<string, mixed> */
    public function all(): array
    {
        if (! $this->usable()) {
            return $this->fallback->all();
        }

        $all = [];

        foreach ($this->owned()->get(['key', 'value']) as $row) {
            if (is_string($row->key ?? null)) {
                $all[$row->key] = is_string($row->value ?? null) ? self::decode($row->value, null) : null;
            }
        }

        return $all;
    }

    public function clear(): bool
    {
        if (! $this->usable()) {
            return $this->fallback->clear();
        }

        $this->owned()->delete();

        return true;
    }

    public function isAvailable(): bool
    {
        return $this->usable() || $this->fallback->isAvailable();
    }

    public function getTier(): string
    {
        return $this->usable() ? 'database' : $this->fallback->getTier();
    }

    /** @param array<string, mixed> $preferences */
    public function putAll(array $preferences): bool
    {
        if (! $this->usable()) {
            return $this->fallback->putAll($preferences);
        }

        return $this->connection()->transaction(function () use ($preferences): bool {
            foreach ($preferences as $key => $value) {
                if (! $this->put($key, $value)) {
                    return false;
                }
            }

            return true;
        });
    }

    public function getBrowserId(): ?string
    {
        return $this->usable() ? null : $this->fallback->getBrowserId();
    }

    private static function decode(string $json, mixed $default): mixed
    {
        try {
            return json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return $default;
        }
    }

    /** Whether rows can be read and written: an owner, and a migrated table. */
    private function usable(): bool
    {
        return $this->scope !== null && $this->scope->id !== '' && $this->tableExists();
    }

    private function tableExists(): bool
    {
        if ($this->tableExists !== null) {
            return $this->tableExists;
        }

        try {
            $connection = $this->connection();
            $exists = $connection instanceof Connection && $connection->getSchemaBuilder()->hasTable(self::TABLE);
        } catch (Throwable) {
            // No database configured, or unreachable: behave as the session store.
            $exists = false;
        }

        return $this->tableExists = $exists;
    }

    /** @return array{owner_type: string, owner_id: string} */
    private function ownerColumns(): array
    {
        return [
            'owner_type' => $this->scope->type ?? '',
            'owner_id'   => $this->scope->id ?? '',
        ];
    }

    private function owned(): Builder
    {
        return $this->rows()->where($this->ownerColumns());
    }

    private function rows(): Builder
    {
        return $this->connection()->table(self::TABLE);
    }

    private function connection(): ConnectionInterface
    {
        return $this->connections->connection();
    }
}
