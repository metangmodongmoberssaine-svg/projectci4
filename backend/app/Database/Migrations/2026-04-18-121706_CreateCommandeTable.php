<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateCommandeTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'                => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_user'           => ['type'=>'INT','unsigned'=>true],
            'id_livreur'        => ['type'=>'INT','unsigned'=>true,'null'=>true],
            'id_promotion'      => ['type'=>'INT','unsigned'=>true,'null'=>true],
            'adresse_livraison' => ['type'=>'VARCHAR','constraint'=>255],
            'montant_total'     => ['type'=>'DECIMAL','constraint'=>'10,2'],
            'montant_remise'    => ['type'=>'DECIMAL','constraint'=>'10,2','default'=>0],
            'status'            => ['type'=>'ENUM','constraint'=>['en_attente','en_preparation','en_livraison','livree','annulee'],'default'=>'en_attente'],
            'created_at'        => ['type'=>'DATETIME','null'=>true],
            'updated_at'        => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_user','users','id','CASCADE','CASCADE');
        $this->forge->addForeignKey('id_livreur','users','id','SET NULL','CASCADE');
        $this->forge->addForeignKey('id_promotion','promotions','id','SET NULL','CASCADE');
        $this->forge->createTable('commande');
    }
 
    public function down()
    {
        $this->forge->dropTable('commande');
    }
}
