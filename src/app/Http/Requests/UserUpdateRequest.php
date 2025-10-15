<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = (int) $this->route('id');

        return [
            'code' => [
                'required', 'string', 'max:10', 'regex:/^[0-9A-Za-z]+$/',
                Rule::unique('m_users', 'code')->ignore($id, 'id'),
            ],
            'name' => ['required', 'string', 'max:100'],
            'mail' => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('m_users', 'mail')->ignore($id, 'id'),
            ],
            'enabled' => ['nullable', 'integer', Rule::in([0,1])],
        ];
    }
}

