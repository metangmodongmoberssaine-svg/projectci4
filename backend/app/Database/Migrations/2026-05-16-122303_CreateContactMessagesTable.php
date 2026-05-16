<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateContactMessagesTable extends Migration
{
  // database/migrations/xxxx_xx_xx_xxxxxx_CreateContactMessagesTable.php
public function up()
{
    $this->forge->addField([
        'id'          => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
        'name'        => ['type' => 'VARCHAR', 'constraint' => 50],
        'email'       => ['type' => 'VARCHAR', 'constraint' => 50],
        'subject'     => ['type' => 'VARCHAR', 'constraint' => 191],
        'message'     => ['type' => 'TEXT'],
        'is_read'     => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
        'reply'       => ['type' => 'TEXT', 'null' => true],     // Stocker la réponse de l'admin
        'replied_at'  => ['type' => 'DATETIME', 'null' => true],
        'created_at'  => ['type' => 'DATETIME', 'null' => true],
        'updated_at'  => ['type' => 'DATETIME', 'null' => true],
    ]);
    $this->forge->addKey('id', true);
    $this->forge->createTable('contact_messages');
}

public function down()
{
    $this->forge->dropTable('contact_messages');
}
}
