<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => 'Ruangan :attribute mesti diterima.',
    'accepted_if' => 'Ruangan :attribute mesti diterima apabila :other ialah :value.',
    'active_url' => 'Ruangan :attribute mesti merupakan URL yang sah.',
    'after' => 'Ruangan :attribute mesti tarikh selepas :date.',
    'after_or_equal' => 'Ruangan :attribute mesti tarikh selepas atau sama dengan :date.',
    'alpha' => 'Ruangan :attribute hanya boleh mengandungi huruf.',
    'alpha_dash' => 'Ruangan :attribute hanya boleh mengandungi huruf, nombor, sengkang dan garis bawah.',
    'alpha_num' => 'Ruangan :attribute hanya boleh mengandungi huruf dan nombor.',
    'array' => 'Ruangan :attribute mesti berbentuk tatasusunan.',
    'ascii' => 'Ruangan :attribute hanya boleh mengandungi aksara ASCII.',
    'before' => 'Ruangan :attribute mesti tarikh sebelum :date.',
    'before_or_equal' => 'Ruangan :attribute mesti tarikh sebelum atau sama dengan :date.',

    'between' => [
        'array' => 'Ruangan :attribute mesti mempunyai antara :min hingga :max item.',
        'file' => 'Ruangan :attribute mesti antara :min hingga :max kilobait.',
        'numeric' => 'Ruangan :attribute mesti antara :min hingga :max.',
        'string' => 'Ruangan :attribute mesti antara :min hingga :max aksara.',
    ],

    'boolean' => 'Ruangan :attribute mesti bernilai benar atau palsu.',
    'can' => 'Ruangan :attribute mengandungi nilai yang tidak dibenarkan.',
    'confirmed' => 'Pengesahan ruangan :attribute tidak sepadan.',
    'contains' => 'Ruangan :attribute tidak mengandungi nilai yang diperlukan.',
    'current_password' => 'Kata laluan tidak betul.',
    'date' => 'Ruangan :attribute mesti tarikh yang sah.',
    'date_equals' => 'Ruangan :attribute mesti tarikh yang sama dengan :date.',
    'date_format' => 'Ruangan :attribute mesti mengikut format :format.',
    'decimal' => 'Ruangan :attribute mesti mempunyai :decimal tempat perpuluhan.',
    'declined' => 'Ruangan :attribute mesti ditolak.',
    'declined_if' => 'Ruangan :attribute mesti ditolak apabila :other ialah :value.',
    'different' => 'Ruangan :attribute dan :other mesti berbeza.',
    'digits' => 'Ruangan :attribute mesti mempunyai :digits digit.',
    'digits_between' => 'Ruangan :attribute mesti antara :min hingga :max digit.',
    'dimensions' => 'Dimensi imej ruangan :attribute tidak sah.',
    'distinct' => 'Ruangan :attribute mempunyai nilai pendua.',
    'doesnt_end_with' => 'Ruangan :attribute tidak boleh berakhir dengan nilai berikut: :values.',
    'doesnt_start_with' => 'Ruangan :attribute tidak boleh bermula dengan nilai berikut: :values.',
    'email' => 'Ruangan :attribute mesti alamat e-mel yang sah.',
    'ends_with' => 'Ruangan :attribute mesti berakhir dengan nilai berikut: :values.',
    'enum' => 'Pilihan :attribute tidak sah.',
    'exists' => 'Pilihan :attribute tidak sah.',
    'extensions' => 'Ruangan :attribute mesti mempunyai sambungan berikut: :values.',
    'file' => 'Ruangan :attribute mesti merupakan fail.',
    'filled' => 'Ruangan :attribute mesti mempunyai nilai.',

    'gt' => [
        'array' => 'Ruangan :attribute mesti mempunyai lebih daripada :value item.',
        'file' => 'Ruangan :attribute mesti lebih besar daripada :value kilobait.',
        'numeric' => 'Ruangan :attribute mesti lebih besar daripada :value.',
        'string' => 'Ruangan :attribute mesti lebih daripada :value aksara.',
    ],

    'gte' => [
        'array' => 'Ruangan :attribute mesti mempunyai sekurang-kurangnya :value item.',
        'file' => 'Ruangan :attribute mesti lebih besar atau sama dengan :value kilobait.',
        'numeric' => 'Ruangan :attribute mesti lebih besar atau sama dengan :value.',
        'string' => 'Ruangan :attribute mesti sekurang-kurangnya :value aksara.',
    ],

    'hex_color' => 'Ruangan :attribute mesti warna heksadesimal yang sah.',
    'image' => 'Ruangan :attribute mesti imej.',
    'in' => 'Pilihan :attribute tidak sah.',
    'in_array' => 'Ruangan :attribute mesti wujud dalam :other.',
    'integer' => 'Ruangan :attribute mesti nombor bulat.',
    'ip' => 'Ruangan :attribute mesti alamat IP yang sah.',
    'ipv4' => 'Ruangan :attribute mesti alamat IPv4 yang sah.',
    'ipv6' => 'Ruangan :attribute mesti alamat IPv6 yang sah.',
    'json' => 'Ruangan :attribute mesti rentetan JSON yang sah.',
    'list' => 'Ruangan :attribute mesti senarai.',
    'lowercase' => 'Ruangan :attribute mesti dalam huruf kecil.',

    'lt' => [
        'array' => 'Ruangan :attribute mesti kurang daripada :value item.',
        'file' => 'Ruangan :attribute mesti kurang daripada :value kilobait.',
        'numeric' => 'Ruangan :attribute mesti kurang daripada :value.',
        'string' => 'Ruangan :attribute mesti kurang daripada :value aksara.',
    ],

    'lte' => [
        'array' => 'Ruangan :attribute tidak boleh melebihi :value item.',
        'file' => 'Ruangan :attribute mesti kurang atau sama dengan :value kilobait.',
        'numeric' => 'Ruangan :attribute mesti kurang atau sama dengan :value.',
        'string' => 'Ruangan :attribute mesti kurang atau sama dengan :value aksara.',
    ],

    'mac_address' => 'Ruangan :attribute mesti alamat MAC yang sah.',

    'max' => [
        'array' => 'Ruangan :attribute tidak boleh melebihi :max item.',
        'file' => 'Ruangan :attribute tidak boleh lebih besar daripada :max kilobait.',
        'numeric' => 'Ruangan :attribute tidak boleh lebih besar daripada :max.',
        'string' => 'Ruangan :attribute tidak boleh melebihi :max aksara.',
    ],

    'max_digits' => 'Ruangan :attribute tidak boleh melebihi :max digit.',
    'mimes' => 'Ruangan :attribute mesti fail jenis: :values.',
    'mimetypes' => 'Ruangan :attribute mesti fail jenis: :values.',

    'min' => [
        'array' => 'Ruangan :attribute mesti mempunyai sekurang-kurangnya :min item.',
        'file' => 'Ruangan :attribute mesti sekurang-kurangnya :min kilobait.',
        'numeric' => 'Ruangan :attribute mesti sekurang-kurangnya :min.',
        'string' => 'Ruangan :attribute mesti sekurang-kurangnya :min aksara.',
    ],

    'min_digits' => 'Ruangan :attribute mesti mempunyai sekurang-kurangnya :min digit.',
    'missing' => 'Ruangan :attribute mesti tiada.',
    'missing_if' => 'Ruangan :attribute mesti tiada apabila :other ialah :value.',
    'missing_unless' => 'Ruangan :attribute mesti tiada kecuali :other ialah :value.',
    'missing_with' => 'Ruangan :attribute mesti tiada apabila :values wujud.',
    'missing_with_all' => 'Ruangan :attribute mesti tiada apabila :values wujud.',
    'multiple_of' => 'Ruangan :attribute mesti gandaan :value.',
    'not_in' => 'Pilihan :attribute tidak sah.',
    'not_regex' => 'Format ruangan :attribute tidak sah.',
    'numeric' => 'Ruangan :attribute mesti nombor.',

    'password' => [
        'letters' => 'Ruangan :attribute mesti mengandungi sekurang-kurangnya satu huruf.',
        'mixed' => 'Ruangan :attribute mesti mengandungi sekurang-kurangnya satu huruf besar dan satu huruf kecil.',
        'numbers' => 'Ruangan :attribute mesti mengandungi sekurang-kurangnya satu nombor.',
        'symbols' => 'Ruangan :attribute mesti mengandungi sekurang-kurangnya satu simbol.',
        'uncompromised' => ':attribute telah terdedah dalam kebocoran data. Sila pilih :attribute lain.',
    ],

    'present' => 'Ruangan :attribute mesti wujud.',
    'present_if' => 'Ruangan :attribute mesti wujud apabila :other ialah :value.',
    'present_unless' => 'Ruangan :attribute mesti wujud kecuali :other ialah :value.',
    'present_with' => 'Ruangan :attribute mesti wujud apabila :values wujud.',
    'present_with_all' => 'Ruangan :attribute mesti wujud apabila :values wujud.',

    'prohibited' => 'Ruangan :attribute adalah dilarang.',
    'prohibited_if' => 'Ruangan :attribute adalah dilarang apabila :other ialah :value.',
    'prohibited_unless' => 'Ruangan :attribute adalah dilarang kecuali :other berada dalam :values.',
    'prohibits' => 'Ruangan :attribute melarang :other daripada wujud.',
    'regex' => 'Format ruangan :attribute tidak sah.',
    'required' => 'Ruangan :attribute adalah wajib.',
    'required_array_keys' => 'Ruangan :attribute mesti mengandungi entri untuk: :values.',
    'required_if' => 'Ruangan :attribute adalah wajib apabila :other ialah :value.',
    'required_if_accepted' => 'Ruangan :attribute adalah wajib apabila :other diterima.',
    'required_if_declined' => 'Ruangan :attribute adalah wajib apabila :other ditolak.',
    'required_unless' => 'Ruangan :attribute adalah wajib kecuali :other berada dalam :values.',
    'required_with' => 'Ruangan :attribute adalah wajib apabila :values wujud.',
    'required_with_all' => 'Ruangan :attribute adalah wajib apabila :values wujud.',
    'required_without' => 'Ruangan :attribute adalah wajib apabila :values tidak wujud.',
    'required_without_all' => 'Ruangan :attribute adalah wajib apabila tiada :values wujud.',
    'same' => 'Ruangan :attribute mesti sama dengan :other.',

    'size' => [
        'array' => 'Ruangan :attribute mesti mengandungi :size item.',
        'file' => 'Ruangan :attribute mesti bersaiz :size kilobait.',
        'numeric' => 'Ruangan :attribute mesti bersaiz :size.',
        'string' => 'Ruangan :attribute mesti mengandungi :size aksara.',
    ],

    'starts_with' => 'Ruangan :attribute mesti bermula dengan nilai berikut: :values.',
    'string' => 'Ruangan :attribute mesti rentetan.',
    'timezone' => 'Ruangan :attribute mesti zon waktu yang sah.',
    'unique' => ':attribute telah digunakan.',
    'uploaded' => 'Muat naik :attribute gagal.',
    'uppercase' => 'Ruangan :attribute mesti huruf besar.',
    'url' => 'Ruangan :attribute mesti URL yang sah.',
    'ulid' => 'Ruangan :attribute mesti ULID yang sah.',
    'uuid' => 'Ruangan :attribute mesti UUID yang sah.',
    'without_spaces' => 'Ruangan :attribute tidak boleh mengandungi ruang kosong.',
    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'Mesej ralat tersuai',
        ],
        'username' => [
            'without_spaces' => ':attribute tidak boleh mengandungi ruang kosong.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [],

];
