<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/**
 * A signed-in user's browser data, keyed by owner rather than by session.
 *
 * Favourites, collections, history, command history and preferences all live
 * in core's preference store under string keys, so one key/value table keyed
 * by `owner_type` + `owner_id` holds every one of them. The owner pair is
 * core's `PreferenceOwner`: the model's morph class (so a host's morph map is
 * honoured) and the auth identifier as a string (so UUID and integer users
 * are stored alike).
 *
 * 191 characters per indexed column keeps the unique index inside InnoDB's
 * 3,072-byte limit at utf8mb4 (3 x 191 x 4 = 2,292 bytes).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ichava_owner_preferences', function (Blueprint $table) {
            $table->id();
            $table->string('owner_type', 191);
            $table->string('owner_id', 191);
            $table->string('key', 191);
            $table->json('value')->nullable();
            $table->timestamps();

            $table->unique(['owner_type', 'owner_id', 'key'], 'uniq_ichava_owner_preferences');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ichava_owner_preferences');
    }
};
