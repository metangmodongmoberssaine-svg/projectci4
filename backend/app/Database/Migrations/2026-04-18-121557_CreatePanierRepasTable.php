<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreatePanierRepasTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'            => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_panier'     => ['type'=>'INT','unsigned'=>true],
            'id_repas'      => ['type'=>'INT','unsigned'=>true],
            'quantite'      => ['type'=>'INT'],
            'prix_unitaire' => ['type'=>'DECIMAL','constraint'=>'10,2'],
            'created_at'    => ['type'=>'DATETIME','null'=>true],
            'updated_at'    => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_panier','panier','id','CASCADE','CASCADE');
        $this->forge->addForeignKey('id_repas','repas','id','CASCADE','CASCADE');
        $this->forge->createTable('panier_repas');
    }
 
    public function down()
    {
        $this->forge->dropTable('panier_repas');
    }
}
