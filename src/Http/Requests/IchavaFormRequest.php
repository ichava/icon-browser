<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Traits\ApiResponseTrait;

/**
 * The edge of a request both the web pages and the REST API take (re-audit F-09). A JSON caller
 * gets the API's own validation body (`success: false`, `error`, `errors`), as the controllers'
 * inline `validate()` produced it; a page visit gets Laravel's redirect back with the errors.
 * Authorisation is the routes' middleware's, so every request here authorises.
 */
abstract class IchavaFormRequest extends FormRequest
{
    use ApiResponseTrait;

    public function authorize(): bool
    {
        return true;
    }

    protected function failedValidation(Validator $validator): void
    {
        if ($this->expectsJson()) {
            throw new HttpResponseException($this->validationErrorResponse($validator->errors()->toArray(), 'Validation failed'));
        }

        parent::failedValidation($validator);
    }
}
