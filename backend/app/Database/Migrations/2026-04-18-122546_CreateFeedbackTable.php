<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateFeedbackTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'          => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_user'     => ['type'=>'INT','unsigned'=>true],
            'note'        => ['type'=>'TINYINT'],
            'commentaire' => ['type'=>'TEXT','null'=>true],
            'created_at'  => ['type'=>'DATETIME','null'=>true],
            'updated_at'  => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_user','users','id','CASCADE','CASCADE');
        $this->forge->createTable('feedback');
    }
 
    public function down()
    {
        $this->forge->dropTable('feedback');
    }
}
