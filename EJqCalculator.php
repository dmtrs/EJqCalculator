<?php
/**
 * EJqCalculator 
 * -------------
 * Extensions for the yii framework to support jquery jq-calculator plugin.
 *
 * ###Use
 * ~~~
 * [php]
 *  <div>name="left[0]"</div><input name="left[0]">
 *  <div>name="right[0]"</div><input name="right[0]" class=""> 
 *  <div>id="sum:0" / name="sum[0]"</div><input name="sum[0]" id="sum" class="">
 *  <?php 
 *      $this->widget('application.extensions.EJqCalculator.EJqCalculator', array(
 *      'addFormula'=>'{{left[0]}} + {{right[0]}}',
 *      'selector'=>'#sum',
 *  ));?>
 * ~~~
 *
 * ###Resources
 * - [jq calculator homepage](http://jq-calculator.sourceforge.net/)
 * - [github repository](http://www.github.com/dmtrs/...)
 *
 * ###Changelog
 * ####Version 0.1
 * - Initial release.
 *
 * @author Dimitrios Mengidis <tydeas.dr@gmail.com>
 * @version 0.1
 **/
class EJqCalculator extends CWidget
{
    public $addFormula = null;
    public $selector = null;

    public $position = CClientScript::POS_READY;
    
    private $jsFiles = array(
        'jq-calc.js',
        'jq-calc-ext.js',
        'jq-calc-formula-tracker.js',);
    
    private $jsPath = "js";

    private $js = null;
    
    private function registerLibraries()
    {
        $cs = Yii::app()->clientScript;

        if(!$cs->isScriptRegistered('jquery')) {
            $cs->registerCoreScript('jquery');
        }
        if($this->js===null) {
            $jsPath = dirname(__FILE__).DIRECTORY_SEPARATOR.$this->jsPath.DIRECTORY_SEPARATOR;

            $jsAssetPath = Yii::app()->getAssetManager()->publish($jsPath);
            foreach($this->jsFiles as $file)
            {
                $cs->registerScriptFile($jsAssetPath.DIRECTORY_SEPARATOR.$file, CClientScript::POS_HEAD);
            }
        }
    }
    private function registerScript($script)
    {      
        Yii::app()->clientScript->registerScript($this->id.'-jsscript', $script, $this->position);
    }
    public function init()
    {    
        $this->registerLibraries();
        parent::init();
    }
    public function run()
    {
        $script = "$('".$this->selector."').addFormula('".$this->addFormula."');";
        $this->registerScript($script);
    }
}
