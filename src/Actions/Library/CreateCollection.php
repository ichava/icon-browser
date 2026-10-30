<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/**
 * Create a collection for the current owner, holding the icons it was made from.
 *
 * The browser creates a collection from an icon or a selection, and its id is only known
 * once this answers, so the icons travel with the create rather than as adds after it.
 */
final readonly class CreateCollection
{
    /** The most icons one create may carry. */
    public const int MAX_ICONS = 500;

    public function __construct(private IconPreferenceService $preferences) {}

    /**
     * The validation both create routes (Inertia and `/api/v1`) apply.
     *
     * @return array<string, string|list<string>>
     */
    public static function rules(): array
    {
        return [
            'name'       => 'required|string|max:100',
            'color'      => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'icon_ids'   => ['sometimes', 'array', 'max:' . self::MAX_ICONS],
            'icon_ids.*' => ['integer', 'min:1'],
        ];
    }

    /**
     * @param list<int> $iconIds The icons the collection starts with, in order. An id no
     *                           icon has is skipped, as adding it on its own would refuse it.
     *
     * @return array<string, mixed> The stored collection, `id` and `icon_ids` included.
     */
    public function handle(string $name, ?string $color = null, array $iconIds = []): array
    {
        $collection = $this->preferences->createCollection($name, $color);
        $id = $collection['id'];

        if ($iconIds === [] || ! is_string($id)) {
            return $collection;
        }

        $known = [];

        foreach (Icon::query()->whereIn('id', array_unique($iconIds))->pluck('id') as $existing) {
            if (is_numeric($existing)) {
                $known[(int) $existing] = true;
            }
        }

        foreach (array_unique($iconIds) as $iconId) {
            if (isset($known[$iconId])) {
                $this->preferences->addIconToCollection($id, $iconId);
            }
        }

        /** @var array<string, mixed>|null $stored */
        $stored = $this->preferences->getCollection($id);

        return $stored ?? $collection;
    }
}
