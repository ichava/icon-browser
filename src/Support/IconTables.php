<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

use Simtabi\Laranail\Ichava\Models\Icon;

/**
 * The names of ichava/core's icon tables, once, so no controller or query in this package writes
 * one by hand (re-audit F-08). Constants, not lookups, because raw SQL may only interpolate a
 * literal string (Larastan's `selectRaw()` rule). `ICONS` is core's own `Icon::TABLE`; core gives
 * the term table and its pivot no constant, so `HttpLayerConventionsTest` holds these to
 * `IconTerm::getTable()` and the pivot `IconTerm::icons()` names.
 */
final class IconTables
{
    public const string ICONS = Icon::TABLE;

    public const string TERMS = 'ichava_icon_terms';

    public const string TERMABLES = 'ichava_icon_termables';
}
