<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => [
                'required', 'string', 'max:10', 'regex:/^[0-9A-Za-z]+$/',
                Rule::unique('m_users', 'code'),
            ],
            'name' => ['required', 'string', 'max:100'],
            'mail' => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('m_users', 'mail'),
            ],
            'enabled' => ['nullable', 'integer', Rule::in([0,1])],
        ];
    }
}

