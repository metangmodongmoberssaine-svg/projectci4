<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateCommandeRepasTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'            => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_commande'   => ['type'=>'INT','unsigned'=>true],
            'id_repas'      => ['type'=>'INT','unsigned'=>true],
            'quantite'      => ['type'=>'INT'],
            'prix_snapshot' => ['type'=>'DECIMAL','constraint'=>'10,2'],
            'created_at'    => ['type'=>'DATETIME','null'=>true],
            'updated_at'    => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_commande','commande','id','CASCADE','CASCADE');
        $this->forge->addForeignKey('id_repas','repas','id','CASCADE','CASCADE');
        $this->forge->createTable('commande_repas');
    }
 
    public function down()
    {
        $this->forge->dropTable('commande_repas');
    }
}
