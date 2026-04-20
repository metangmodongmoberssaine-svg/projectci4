<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateRemboursementsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'               => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_commande'      => ['type'=>'INT','unsigned'=>true],
            'id_user'          => ['type'=>'INT','unsigned'=>true],
            'id_paiement'      => ['type'=>'INT','unsigned'=>true],
            'montant'          => ['type'=>'DECIMAL','constraint'=>'10,2'],
            'motif'            => ['type'=>'TEXT','null'=>true],
            'statut'           => ['type'=>'ENUM','constraint'=>['en_attente','approuve','effectue','rejete'],'default'=>'en_attente'],
            'reference_retour' => ['type'=>'VARCHAR','constraint'=>100,'null'=>true],
            'created_at'       => ['type'=>'DATETIME','null'=>true],
            'updated_at'       => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_commande','commande','id','CASCADE','CASCADE');
        $this->forge->addForeignKey('id_user','users','id','CASCADE','CASCADE');
        $this->forge->addForeignKey('id_paiement','paiement','id','CASCADE','CASCADE');
        $this->forge->createTable('remboursements');
    }
 
    public function down()
    {
        $this->forge->dropTable('remboursements');
    }
}
