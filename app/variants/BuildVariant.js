
import Stagging from './brands/Stagging';
import Dev from './brands/Dev';
import configs from './configs';

/*
*/
class BuildVariant {
    static kStagging = 'Stagging';
    static kDev = 'Dev';

    static variant = configs.buildMode == 'dev' ? BuildVariant.kDev : BuildVariant.kStagging;
    static variants = [
        BuildVariant.kNetpower,
        BuildVariant.kProduction,
    ];

    static activeVariant() {
        switch (this.variant) {
            case this.kDev:
                return Dev;
            case this.kStagging:
                return Stagging;
            default:
                return Dev;
        }
    }

}

module.exports = BuildVariant;