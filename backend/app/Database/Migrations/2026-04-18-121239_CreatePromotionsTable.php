<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreatePromotionsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'           => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_repas'     => ['type'=>'INT','unsigned'=>true,'null'=>true],
            'id_categorie' => ['type'=>'INT','unsigned'=>true,'null'=>true],
            'code'         => ['type'=>'VARCHAR','constraint'=>50],
            'valeur'       => ['type'=>'DECIMAL','constraint'=>'10,2'],
            'type'         => ['type'=>'ENUM','constraint'=>['pourcentage','montant_fixe']],
            'date_debut'   => ['type'=>'DATE'],
            'date_fin'     => ['type'=>'DATE'],
            'is_actif'     => ['type'=>'TINYINT','constraint'=>1,'default'=>1],
            'created_at'   => ['type'=>'DATETIME','null'=>true],
            'updated_at'   => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('code');
        $this->forge->addForeignKey('id_repas','repas','id','SET NULL','CASCADE');
        $this->forge->addForeignKey('id_categorie','categories','id','SET NULL','CASCADE');
        $this->forge->createTable('promotions');
    }
 
    public function down()
    {
        $this->forge->dropTable('promotions');
    }
}

