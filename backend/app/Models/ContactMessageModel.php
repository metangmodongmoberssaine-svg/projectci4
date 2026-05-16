<?php namespace App\Models;
// app/Models/ContactMessageModel.php
use CodeIgniter\Model;

class ContactMessageModel extends Model
{
    protected $table            = 'contact_messages';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['name', 'email', 'subject', 'message', 'is_read', 'reply', 'replied_at'];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $validationRules = [
        'name'    => 'required|min_length[2]|max_length[50]',
        'email'   => 'required|valid_email',
        'subject' => 'required|max_length[191]',
        'message' => 'required|min_length[5]',
    ];
}