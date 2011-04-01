<?php
/**
 * EJqCalculator 
 * -------------
 * Extensions for the yii framework to support jquery jq-calculator plugin.
 *
 * ###Use
 * ~~~
 * [php]
 *
 * <table>
 * 	<tr>
 * 		<td>
 * 			<input type="text" name='l[0]'/>
 * 		</td>
 * 		<td>
 * 			<input type="text" name='r[0]'/>
 * 		</td>
 *		<td>
 *			<input type="text" id='sum0' />
 *		</td>
 *	</tr>
 *	<tr>
 *		<td>
 *			<input type="text" name='l[1]'/>
 *		</td>
 *		<td>
 *			<input type="text" name='r[1]' />
 *		</td>
 *		<td>
 *			<input type="text" id='sum1' />
 *		</td>
 *	</tr>
 *	<tr>
 *		<th colspan='2'>
 *          Total Sum
 *		</th>
 *		<td>
 *			<input type="text" id='total'/>
 * 		</td>
 *	</tr>
 * </table>
 *
 * <?php $this->widget('application.extensions.EJqCalculator.EJqCalculator', array(
 *    'addFormula'=>array(
 *        '#sum0'=>'{{l[0]}} * {{r[0]}}',
 *        '#sum1'=>'{{l[1]}} * {{r[1]}}',
 *        '#total'=>'{{#sum0}} + {{#sum1}}'
 *    ),
 * ));?>
 * ~~~
 *
 * ###Resources
 * - [Jq calculator homepage](http://jq-calculator.sourceforge.net/)
 * - [Github repository](http://www.github.com/dmtrs/...)
 * - [Extension site](http://www.yiiframework.cok/extensions/ejqcalculator/)
 *
 * ###Changelog
 * ####Version 0.1.1
 * - Documentation added.
 * - Change of the properties passed to widget structure.
 * ####Version 0.1
 * - Initial release.
 *
 * @author Dimitrios Mengidis <tydeas.dr@gmail.com>
 * @version 0.1.1
 **/
class EJqCalculator extends CWidget
{
    /**
     * @var array selector=>formula paired array.
     * @see EJqCalculater::addFormula
     * @since 0.1
     */
    public $addFormula;
    /**
     * @var array
     * @since 0.1.1
     */
    public $aggregate;
    /**
     * @var array
     * @since 0.1.1
     */
    public $aggregateTo;
    /**
     * @var string
     * @since 0.1
     */
    public $selector = null;
    /**
     * @var integer the position of the script registration.
     * @see CClientScript::registerScript
     * @since 0.1.1
     */
    public $position = CClientScript::POS_READY;
    /**
     * @var array all available jq-calculator libraries.
     * @link http://jq-calculator.sourceforge.net/
     * @since 0.1
     */
    private $jsFiles = array(
        'jq-calc.js',
        'jq-calc-ext.js',
        'jq-calc-formula-tracker.js',);
    /**
     * @var string the folder containt the jq-calculator libraries.
     * @since 0.1
     */
    private $jsPath = "js";
    /**
     * @var array all availabe functions.
     * @since 0.1.1
     */
    private $functions = array(
        'addFormula', 'aggregate', 'aggregateTo',
    );
    /**
     * @var CClientScript he CClientScript object for the registered libarries.
     * @see CClientScript::registerScriptFile
     * @since 0.1
     */
    private $js = null;
    /** 
     * Register all the required libraries for the jq-calculator plugin. 
     *
     * @since 0.1
     **/
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
                $this->js = $cs->registerScriptFile($jsAssetPath.DIRECTORY_SEPARATOR.$file, CClientScript::POS_HEAD);
            }
        }
    }
    /** 
     * Initialization of the widget. Register the libraries of the plugin.
     *
     * @see EJqCalculator::registerLibraries
     * @since 0.1
     */
    public function init()
    {    
        $this->registerLibraries();
        parent::init();
    }
    public function run()
    {
        $script = '';
        foreach($this->functions as $f)
        {
            if(isset($this->$f)) 
                $script .= $this->$f();
        }
        if(!empty($script))
            $this->registerScript($script);
    }
    /**
     * Generate js script code using the addFormula method.
     *
     * @link http://jq-calculator.sourceforge.net/#Plugin_Calculator_API_addFormula_method
     * @return string 
     * @since 0.1.1
     **/
    private function addFormula()
    {
        $s = '';
        foreach($this->addFormula as $selector=>$formula)
        {
            $s .= "$('".$selector."').addFormula('".$formula."');\n";
        }
        return $s;
    }
    /**
     * Register the js script generated from the available functions.
     * 
     * @see EJqCalculator::$functions
     * @since 0.1
     */
    private function registerScript($script)
    {      
        Yii::app()->clientScript->registerScript($this->id.'-jsscript', $script, $this->position);
    }
}
