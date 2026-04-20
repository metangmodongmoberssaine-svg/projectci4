<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateLivraisonsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'            => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_commande'   => ['type'=>'INT','unsigned'=>true],
            'id_livreur'    => ['type'=>'INT','unsigned'=>true],
            'position_gps'  => ['type'=>'VARCHAR','constraint'=>100,'null'=>true],
            'heure_estimee' => ['type'=>'DATETIME','null'=>true],
            'statut'        => ['type'=>'ENUM','constraint'=>['assignee','en_route','livree'],'default'=>'assignee'],
            'created_at'    => ['type'=>'DATETIME','null'=>true],
            'updated_at'    => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_commande','commande','id','CASCADE','CASCADE');
        $this->forge->addForeignKey('id_livreur','users','id','CASCADE','CASCADE');
        $this->forge->createTable('livraisons');
    }
 
    public function down()
    {
        $this->forge->dropTable('livraisons');
    }
}
