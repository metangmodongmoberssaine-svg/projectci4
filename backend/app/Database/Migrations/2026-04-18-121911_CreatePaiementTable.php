<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreatePaiementTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'          => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_commande' => ['type'=>'INT','unsigned'=>true],
            'id_user'     => ['type'=>'INT','unsigned'=>true],
            'montant'     => ['type'=>'DECIMAL','constraint'=>'10,2'],
            'methode'     => ['type'=>'ENUM','constraint'=>['mtn_money','orange_money','afriland']],
            'statut'      => ['type'=>'ENUM','constraint'=>['en_attente','reussi','echoue'],'default'=>'en_attente'],
            'reference'   => ['type'=>'VARCHAR','constraint'=>100,'null'=>true],
            'created_at'  => ['type'=>'DATETIME','null'=>true],
            'updated_at'  => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_commande','commande','id','CASCADE','CASCADE');
        $this->forge->addForeignKey('id_user','users','id','CASCADE','CASCADE');
        $this->forge->createTable('paiement');
    }
 
    public function down()
    {
        $this->forge->dropTable('paiement');
    }
}
