<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;

/**
 * ApiResponseTrait
 *
 * Standardized API response formatting for all controllers
 */
trait ApiResponseTrait
{
    /**
     * Return successful response with data
     *
     * @param array<string, mixed> $meta
     */
    protected function successResponse(
        mixed $data = null,
        string $message = 'Success',
        int $status = Response::HTTP_OK,
        array $meta = [],
    ): JsonResponse {
        $response = [
            'success' => true,
            'data'    => $data,
            'message' => $message,
        ];

        if (! empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $status);
    }

    /**
     * Return error response
     *
     * @param array<mixed> $errors
     * @param array<string, mixed> $meta
     */
    protected function errorResponse(
        string $error,
        int $status = Response::HTTP_BAD_REQUEST,
        array $errors = [],
        array $meta = [],
    ): JsonResponse {
        $response = [
            'success' => false,
            'error'   => $error,
        ];

        if (! empty($errors)) {
            $response['errors'] = $errors;
        }

        if (! empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $status);
    }

    /**
     * Return validation error response
     *
     * @param array<mixed> $errors
     */
    protected function validationErrorResponse(
        array $errors,
        string $message = 'Validation failed',
    ): JsonResponse {
        return $this->errorResponse(
            $message,
            Response::HTTP_UNPROCESSABLE_ENTITY,
            $errors,
        );
    }

    /**
     * Return not found response
     */
    protected function notFoundResponse(
        string $resource = 'Resource',
        mixed $identifier = null,
    ): JsonResponse {
        $message = $identifier
            ? "{$resource} '" . Helpers::stringOf($identifier) . "' not found"
            : "{$resource} not found";

        return $this->errorResponse(
            $message,
            Response::HTTP_NOT_FOUND,
        );
    }

    /**
     * Return created response
     */
    protected function createdResponse(
        mixed $data = null,
        string $message = 'Resource created successfully',
    ): JsonResponse {
        return $this->successResponse(
            $data,
            $message,
            Response::HTTP_CREATED,
        );
    }

    /**
     * Return updated response
     */
    protected function updatedResponse(
        mixed $data = null,
        string $message = 'Resource updated successfully',
    ): JsonResponse {
        return $this->successResponse(
            $data,
            $message,
            Response::HTTP_OK,
        );
    }

    /**
     * Return deleted response
     */
    protected function deletedResponse(
        string $message = 'Resource deleted successfully',
    ): JsonResponse {
        return $this->successResponse(
            null,
            $message,
            Response::HTTP_OK,
        );
    }

}
