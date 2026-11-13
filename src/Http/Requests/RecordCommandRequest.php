<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Requests;

use Simtabi\Laranail\Ichava\IconBrowser\Data\RecordCommandData;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\RecordCommand;

final class RecordCommandRequest extends IchavaFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'command'  => 'required|string|max:255',
            'type'     => 'required|string|in:' . implode(',', RecordCommand::TYPES),
            'metadata' => 'sometimes|array',
        ];
    }

    public function toData(): RecordCommandData
    {
        /** @var array{command: string, type: string, metadata?: array<array-key, mixed>} $v */
        $v = $this->validated();

        return new RecordCommandData($v['command'], $v['type'], $v['metadata'] ?? []);
    }
}
