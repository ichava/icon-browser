<?php

declare(strict_types=1);

/*
 * What this package's Artisan commands say to a person at a terminal. The
 * command's `$description` stays untranslated, as in ichava/core: Artisan reads
 * it before a locale is necessarily set.
 */
return [

    'inject_scripts' => [
        'not_found'       => 'package.json not found at: :path',
        'unparseable'     => 'Could not parse package.json: :error',
        'already_present' => 'Ichava npm scripts already present, nothing to do. Use --force to overwrite.',
        'injected'        => 'Ichava npm scripts injected into package.json:',
    ],

    'install' => [
        'intro'           => 'Installing the Ichava icon browser.',
        'config'          => 'Config (kept if already published)',
        'assets'          => 'Browser assets',
        'table'           => 'Library table (ichava_owner_preferences)',
        'present'         => 'present',
        'created'         => 'created',
        'missing'         => 'still missing: run php artisan migrate',
        'table_skipped'   => 'Library table not created. Signed-in users keep their library in the session until it is (php artisan migrate).',
        'migrate_confirm' => 'Create the library table now (php artisan migrate)?',
        'user'            => 'Host user',
        'guard_ok'        => 'read from the :guard guard',
        'guard_failed'    => 'The host user could not be read: :error. Check ichava.ichava-core.auth.guard.',
        'gate_defined'    => 'defined',
        'gate_undefined'  => 'not defined (denied)',
        'gate_hint'       => 'Grant admin access in your AuthServiceProvider: Gate::define(\'ichava.admin\', fn ($user) => $user->isAdmin());',
        'modes'           => 'Mounted',
        'routes'          => 'Ichava routes',
        'done'            => 'Done. Run php artisan ichava::ichava-core.info doctor for a full health check.',
    ],

];
