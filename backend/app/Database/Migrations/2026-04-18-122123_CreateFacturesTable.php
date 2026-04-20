<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateFacturesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'            => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_commande'   => ['type'=>'INT','unsigned'=>true],
            'montant_total' => ['type'=>'DECIMAL','constraint'=>'10,2'],
            'pdf_url'       => ['type'=>'VARCHAR','constraint'=>255,'null'=>true],
            'created_at'    => ['type'=>'DATETIME','null'=>true],
            'updated_at'    => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_commande','commande','id','CASCADE','CASCADE');
        $this->forge->createTable('factures');
    }
 
    public function down()
    {
        $this->forge->dropTable('factures');
    }
}
