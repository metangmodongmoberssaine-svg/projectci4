<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateNotificationsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'           => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_user'      => ['type'=>'INT','unsigned'=>true,'null'=>true],
            'titre'        => ['type'=>'VARCHAR','constraint'=>150],
            'message'      => ['type'=>'TEXT'],
            'type'         => ['type'=>'VARCHAR','constraint'=>50,'null'=>true],
            'is_read'      => ['type'=>'TINYINT','constraint'=>1,'default'=>0],
            'is_broadcast' => ['type'=>'TINYINT','constraint'=>1,'default'=>0],
            'created_at'   => ['type'=>'DATETIME','null'=>true],
            'updated_at'   => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_user','users','id','SET NULL','CASCADE');
        $this->forge->createTable('notifications');
    }
 
    public function down()
    {
        $this->forge->dropTable('notifications');
    }
}
