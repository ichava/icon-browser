<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Requests;

use Simtabi\Laranail\Ichava\IconBrowser\Data\UpdateCollectionData;

final class UpdateCollectionRequest extends IchavaFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name'  => 'sometimes|required|string|max:100',
            'color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
        ];
    }

    public function toData(): UpdateCollectionData
    {
        /** @var array{name?: string, color?: string|null} $v */
        $v = $this->validated();

        return new UpdateCollectionData($v);
    }
}
