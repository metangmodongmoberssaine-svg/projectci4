<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateMessagesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'              => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_conversation' => ['type'=>'INT','unsigned'=>true],
            'id_expediteur'   => ['type'=>'INT','unsigned'=>true],
            'contenu'         => ['type'=>'TEXT'],
            'type_expediteur' => ['type'=>'ENUM','constraint'=>['client','agent']],
            'is_read'         => ['type'=>'TINYINT','constraint'=>1,'default'=>0],
            'created_at'      => ['type'=>'DATETIME','null'=>true],
            'updated_at'      => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_conversation','conversations','id','CASCADE','CASCADE');
        $this->forge->addForeignKey('id_expediteur','users','id','CASCADE','CASCADE');
        $this->forge->createTable('messages');
    }
 
    public function down()
    {
        $this->forge->dropTable('messages');
    }
}
