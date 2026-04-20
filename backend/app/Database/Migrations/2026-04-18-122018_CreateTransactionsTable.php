<?php
 
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
 
class CreateTransactionsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id'           => ['type'=>'INT','unsigned'=>true,'auto_increment'=>true],
            'id_paiement'  => ['type'=>'INT','unsigned'=>true],
            'provider_ref' => ['type'=>'VARCHAR','constraint'=>100,'null'=>true],
            'payload'      => ['type'=>'TEXT','null'=>true],
            'statut'       => ['type'=>'ENUM','constraint'=>['initie','confirme','echoue','rembourse']],
            'created_at'   => ['type'=>'DATETIME','null'=>true],
            'updated_at'   => ['type'=>'DATETIME','null'=>true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addForeignKey('id_paiement','paiement','id','CASCADE','CASCADE');
        $this->forge->createTable('transactions');
    }
 
    public function down()
    {
        $this->forge->dropTable('transactions');
    }
}
