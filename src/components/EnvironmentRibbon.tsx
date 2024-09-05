
import './EnvironmentRibbon.css';


const EnvironmentRibbon: React.FC<any> = ({position}) => {
  return (
    <div className="parent">
        <h4 className={position}>Test mode</h4>
    </div>
  );
};

export default EnvironmentRibbon;
