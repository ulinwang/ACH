import React from 'react';
import { CheckCircle, Circle, Play } from 'lucide-react';
import { cn } from '../lib/utils';

interface StepConfig {
    id: number;
    title: string;
    description: string;
    icon: string;
    color: string;
}

interface StepNavigatorProps {
    steps: StepConfig[];
    currentStep: number;
    onStepChange: (step: number) => void;
}

export const StepNavigator: React.FC<StepNavigatorProps> = ({
    steps,
    currentStep,
    onStepChange
}) => {
    const getStepStatus = (stepIndex: number) => {
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep) return 'current';
        return 'upcoming';
    };

    const getStepIcon = (stepIndex: number, step: StepConfig) => {
        const status = getStepStatus(stepIndex);

        if (status === 'completed') {
            return <CheckCircle className="h-5 w-5 text-green-600" />;
        }

        if (status === 'current') {
            return <Play className="h-5 w-5 text-blue-600 fill-blue-600" />;
        }

        return <Circle className="h-5 w-5 text-gray-400" />;
    };

    return (
        <div className="p-3 space-y-1">
            {steps.map((step, index) => {
                const status = getStepStatus(index);

                return (
                    <div key={step.id} className="relative">
                        <button
                            onClick={() => onStepChange(index)}
                            className={cn(
                                "w-full text-left p-3 rounded-lg border transition-all duration-200 hover:bg-gray-50",
                                status === 'current' && "bg-blue-50 border-blue-200 shadow-sm",
                                status === 'completed' && "bg-green-50 border-green-200",
                                status === 'upcoming' && "bg-white border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <div className="flex items-start space-x-2">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getStepIcon(index, step)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-base">{step.icon}</span>
                                            <h3 className={cn(
                                                "font-medium text-sm",
                                                status === 'current' && "text-blue-900",
                                                status === 'completed' && "text-green-900",
                                                status === 'upcoming' && "text-gray-700"
                                            )}>
                                                {step.title}
                                            </h3>
                                        </div>
                                        <span className={cn(
                                            "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                                            status === 'current' && "bg-blue-100 text-blue-800",
                                            status === 'completed' && "bg-green-100 text-green-800",
                                            status === 'upcoming' && "bg-gray-100 text-gray-600"
                                        )}>
                                            步骤 {index + 1}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-xs line-clamp-2",
                                        status === 'current' && "text-blue-700",
                                        status === 'completed' && "text-green-700",
                                        status === 'upcoming' && "text-gray-500"
                                    )}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </button>

                        {/* 连接线 */}
                        {index < steps.length - 1 && (
                            <div className="flex justify-center py-1">
                                <div className={cn(
                                    "w-0.5 h-3",
                                    index < currentStep ? "bg-green-300" : "bg-gray-200"
                                )} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}; 