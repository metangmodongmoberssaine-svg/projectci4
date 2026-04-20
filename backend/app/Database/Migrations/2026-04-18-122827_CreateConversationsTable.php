<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateConversationsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'         => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_user'    => ['type'=>'INT','unsigned'=>true],
            'id_agent'   => ['type'=>'INT','unsigned'=>true,'null'=>true],
            'sujet'      => ['type'=>'VARCHAR','constraint'=>200],
            'statut'     => ['type'=>'ENUM','constraint'=>['ouverte','en_cours','resolue','fermee'],'default'=>'ouverte'],
            'created_at' => ['type'=>'DATETIME','null'=>true],
            'updated_at' => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_user','users','id','CASCADE','CASCADE');
        $this->forge->addForeignKey('id_agent','users','id','SET NULL','CASCADE');
        $this->forge->createTable('conversations');
    }
 
    public function down()
    {
        $this->forge->dropTable('conversations');
    }
}
