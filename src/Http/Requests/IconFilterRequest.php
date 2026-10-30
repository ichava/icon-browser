<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use Simtabi\Laranail\Ichava\Enums\IconKind;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;

/**
 * Icon Filter Request
 *
 * Validates and sanitizes icon filtering, searching, sorting and pagination parameters
 */
class IconFilterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            // Search
            'search' => ['nullable', 'string', 'max:255', 'min:2'],

            // Filters
            'packages'     => ['nullable', 'array', 'max:20'],
            'packages.*'   => ['required', 'string', 'max:100'],
            'categories'   => ['nullable', 'array', 'max:50'],
            'categories.*' => ['required', 'string', 'max:100'],
            'variants'     => ['nullable', 'array', 'max:20'],
            'variants.*'   => ['required', 'string', 'max:50'],

            // What the SVG is: icons or illustrations. One kind at a time.
            'kind' => ['nullable', 'string', Rule::enum(IconKind::class)],

            // Nested categories, or variants within the selected category.
            'subs'   => ['nullable', 'array', 'max:50'],
            'subs.*' => ['required', 'string', 'max:100'],

            // Tags and keywords an icon must carry.
            'tags'       => ['nullable', 'array', 'max:20'],
            'tags.*'     => ['required', 'string', 'max:100'],
            'keywords'   => ['nullable', 'array', 'max:20'],
            'keywords.*' => ['required', 'string', 'max:100'],

            // Full-text search language, PostgreSQL only; core refuses any value
            // outside its allow-list before it reaches SQL.
            'language' => ['nullable', 'string', 'max:32', 'regex:/^[a-z_]+$/'],

            // Pagination
            'page'     => ['nullable', 'integer', 'min:1', 'max:10000'],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:120'],

            // Sorting
            'sort_by'        => ['nullable', 'string', 'in:name,package,category,created_at'],
            'sort_direction' => ['nullable', 'string', 'in:asc,desc'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'search.min'        => 'Search query must be at least 2 characters.',
            'search.max'        => 'Search query cannot exceed 255 characters.',
            'packages.max'      => 'You cannot select more than 20 packages at once.',
            'categories.max'    => 'You cannot select more than 50 categories at once.',
            'per_page.min'      => 'Results per page must be at least 10.',
            'per_page.max'      => 'Results per page cannot exceed 120.',
            'sort_by.in'        => 'Invalid sort field. Must be one of: name, package, category, created_at.',
            'sort_direction.in' => 'Sort direction must be either asc or desc.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'search'         => 'search query',
            'packages'       => 'package filters',
            'categories'     => 'category filters',
            'variants'       => 'variant filters',
            'kind'           => 'kind',
            'subs'           => 'subcategory filters',
            'tags'           => 'tag filters',
            'keywords'       => 'keyword filters',
            'language'       => 'search language',
            'page'           => 'page number',
            'per_page'       => 'results per page',
            'sort_by'        => 'sort field',
            'sort_direction' => 'sort direction',
        ];
    }

    /**
     * Get the validated search query
     */
    public function getSearch(): ?string
    {
        $search = $this->validated('search');

        return is_string($search) && (bool) $search ? trim($search) : null;
    }

    /**
     * Get the validated package filters
     *
     * @return array<mixed>
     */
    public function getPackages(): array
    {
        $packages = $this->validated('packages', []);

        return is_array($packages) ? $packages : [];
    }

    /**
     * Get the validated category filters
     *
     * @return array<mixed>
     */
    public function getCategories(): array
    {
        $categories = $this->validated('categories', []);

        return is_array($categories) ? $categories : [];
    }

    /**
     * Get the validated variant filters
     *
     * @return array<mixed>
     */
    public function getVariants(): array
    {
        $variants = $this->validated('variants', []);

        return is_array($variants) ? $variants : [];
    }

    /**
     * Get the validated kind, `icon` or `illustration`, or null for both.
     */
    public function getKind(): ?string
    {
        $kind = $this->validated('kind');

        return is_string($kind) && $kind !== '' ? $kind : null;
    }

    /**
     * Get the validated subcategory filters
     *
     * @return list<string>
     */
    public function getSubs(): array
    {
        return $this->stringList('subs');
    }

    /**
     * Get the validated tag filters
     *
     * @return list<string>
     */
    public function getTags(): array
    {
        return $this->stringList('tags');
    }

    /**
     * Get the validated keyword filters
     *
     * @return list<string>
     */
    public function getKeywords(): array
    {
        return $this->stringList('keywords');
    }

    /**
     * Get the validated search language, or null for the portable search.
     */
    public function getLanguage(): ?string
    {
        $language = $this->validated('language');

        return is_string($language) && $language !== '' ? $language : null;
    }

    /**
     * The filters as core's `IconBrowserService` takes them, for the grid, the
     * facets and the tree alike. One builder, so the REST and Inertia listings
     * cannot filter differently.
     *
     * @return array{search: string|null, language: string|null, packages: array<mixed>, kind: string|null, categories: array<mixed>, subs: list<string>, variants: array<mixed>, tags: list<string>, keywords: list<string>}
     */
    public function filters(): array
    {
        return [
            'search'     => $this->getSearch(),
            'language'   => $this->getLanguage(),
            'packages'   => $this->getPackages(),
            'kind'       => $this->getKind(),
            'categories' => $this->getCategories(),
            'subs'       => $this->getSubs(),
            'variants'   => $this->getVariants(),
            'tags'       => $this->getTags(),
            'keywords'   => $this->getKeywords(),
        ];
    }

    /**
     * Why a listing is empty: `no_match` when a search or filter narrowed it
     * away, `no_icons` when nothing is seeded to show. Null when it is not empty.
     */
    public function emptyReason(int $total): ?string
    {
        if ($total > 0) {
            return null;
        }

        return $this->hasSearch() || $this->hasFilters() ? 'no_match' : 'no_icons';
    }

    /**
     * Get the validated page number
     */
    public function getPage(): int
    {
        return Helpers::intOf($this->validated('page', 1), 1);
    }

    /**
     * Get the validated per page value
     */
    public function getPerPage(): int
    {
        return Helpers::intOf($this->validated('per_page', 60), 60);
    }

    /**
     * Get the validated sort by field
     */
    public function getSortBy(): string
    {
        $sortBy = $this->validated('sort_by', 'name');

        return is_string($sortBy) ? $sortBy : 'name';
    }

    /**
     * Get the validated sort direction
     */
    public function getSortDirection(): string
    {
        $direction = $this->validated('sort_direction', 'asc');

        return is_string($direction) ? $direction : 'asc';
    }

    /**
     * Check if a search query is present
     */
    public function hasSearch(): bool
    {
        return ! empty($this->getSearch());
    }

    /**
     * Check if any filters are applied
     */
    public function hasFilters(): bool
    {
        return ! empty($this->getPackages())
            || ! empty($this->getCategories())
            || ! empty($this->getVariants())
            || $this->getKind() !== null
            || $this->getSubs() !== []
            || $this->getTags() !== []
            || $this->getKeywords() !== [];
    }

    /**
     * @return list<string>
     */
    private function stringList(string $key): array
    {
        $values = $this->validated($key, []);

        return is_array($values) ? array_values(array_filter($values, is_string(...))) : [];
    }
}
