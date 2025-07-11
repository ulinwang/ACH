import React from 'react';
import { Step1Hypotheses } from './steps/Step1Hypotheses';
import { Step2Evidence } from './steps/Step2Evidence';
import { Step3Matrix } from './steps/Step3Matrix';
import { Step4Refine } from './steps/Step4Refine';
import { Step5Conclusion } from './steps/Step5Conclusion';
import { Step6Sensitivity } from './steps/Step6Sensitivity';
import { Step7Report } from './steps/Step7Report';
import { Step8Milestones } from './steps/Step8Milestones';

interface StepConfig {
    id: number;
    title: string;
    description: string;
    icon: string;
    color: string;
}

interface StepContentProps {
    step: StepConfig;
    stepIndex: number;
}

export const StepContent: React.FC<StepContentProps> = ({ step, stepIndex }) => {
    const renderStepContent = () => {
        switch (stepIndex) {
            case 0:
                return <Step1Hypotheses />;
            case 1:
                return <Step2Evidence />;
            case 2:
                return <Step3Matrix />;
            case 3:
                return <Step4Refine />;
            case 4:
                return <Step5Conclusion />;
            case 5:
                return <Step6Sensitivity />;
            case 6:
                return <Step7Report />;
            case 7:
                return <Step8Milestones />;
            default:
                return (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            步骤内容
                        </h3>
                        <p className="text-gray-600">
                            正在开发中...
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {renderStepContent()}
        </div>
    );
}; 