<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateAdressesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'         => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_user'    => ['type'=>'INT','unsigned'=>true],
            'libelle'    => ['type'=>'VARCHAR','constraint'=>100],
            'adresse'    => ['type'=>'VARCHAR','constraint'=>255],
            'ville'      => ['type'=>'VARCHAR','constraint'=>100],
            'is_default' => ['type'=>'TINYINT','constraint'=>1,'default'=>0],
            'created_at' => ['type'=>'DATETIME','null'=>true],
            'updated_at' => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_user','users','id','CASCADE','CASCADE');
        $this->forge->createTable('adresses');
    }
 
    public function down()
    {
        $this->forge->dropTable('adresses');
    }
}
