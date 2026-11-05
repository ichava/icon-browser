<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Requests;

use Simtabi\Laranail\Ichava\IconBrowser\Data\CreateCollectionData;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\CreateCollection;

final class StoreCollectionRequest extends IchavaFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name'       => 'required|string|max:100',
            'color'      => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            'icon_ids'   => ['sometimes', 'array', 'max:' . CreateCollection::MAX_ICONS],
            'icon_ids.*' => ['integer', 'min:1'],
        ];
    }

    public function toData(): CreateCollectionData
    {
        /** @var array{name: string, color?: string|null, icon_ids?: list<int|string>} $v */
        $v = $this->validated();

        return new CreateCollectionData($v['name'], $v['color'] ?? null, array_values(array_map(intval(...), $v['icon_ids'] ?? [])));
    }
}
