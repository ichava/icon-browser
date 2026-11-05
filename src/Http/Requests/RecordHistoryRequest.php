<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Requests;

use Simtabi\Laranail\Ichava\IconBrowser\Data\RecordHistoryData;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\RecordHistory;

final class RecordHistoryRequest extends IchavaFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'icon_id' => 'required|integer',
            'action'  => 'required|string|in:' . implode(',', RecordHistory::ACTIONS),
        ];
    }

    public function toData(): RecordHistoryData
    {
        /** @var array{icon_id: int|string, action: string} $v */
        $v = $this->validated();

        return new RecordHistoryData((int) $v['icon_id'], $v['action']);
    }
}
