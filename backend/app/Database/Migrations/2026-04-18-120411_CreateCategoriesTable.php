<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateCategoriesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'          => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'libelle'     => ['type'=>'VARCHAR','constraint'=>100],
            'description' => ['type'=>'TEXT','null'=>true],
            'icone'       => ['type'=>'VARCHAR','constraint'=>255,'null'=>true],
            'created_at'  => ['type'=>'DATETIME','null'=>true],
            'updated_at'  => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('categories');
    }
 
    public function down()
    {
        $this->forge->dropTable('categories');
    }
}
