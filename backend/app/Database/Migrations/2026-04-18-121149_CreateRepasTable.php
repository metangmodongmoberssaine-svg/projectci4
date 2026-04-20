<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateRepasTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'                => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_categorie'      => ['type'=>'INT','unsigned'=>true],
            'nom'               => ['type'=>'VARCHAR','constraint'=>150],
            'description'       => ['type'=>'TEXT','null'=>true],
            'prix'              => ['type'=>'DECIMAL','constraint'=>'10,2'],
            'quantite'          => ['type'=>'INT','default'=>0],
            'photo'             => ['type'=>'VARCHAR','constraint'=>255,'null'=>true],
            'temps_preparation' => ['type'=>'INT','default'=>0],
            'status'            => ['type'=>'ENUM','constraint'=>['disponible','indisponible'],'default'=>'disponible'],
            'created_at'        => ['type'=>'DATETIME','null'=>true],
            'updated_at'        => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_categorie','categories','id','CASCADE','CASCADE');
        $this->forge->createTable('repas');
    }
 
    public function down()
    {
        $this->forge->dropTable('repas');
    }
}
