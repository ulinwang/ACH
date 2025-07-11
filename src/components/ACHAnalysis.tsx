import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalysisStore } from '../store/analysisStore';
import { StepNavigator } from './StepNavigator';
import { StepContent } from './StepContent';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { CheckCircle, Circle, ArrowRight, Check } from 'lucide-react';

// 步骤配置
const STEPS = [
    {
        id: 1,
        title: '提出假设',
        description: '针对议题，提出假设。如果议题越重要，信息越不确定，需要给出更多的假设。',
        icon: '💡',
        color: 'blue'
    },
    {
        id: 2,
        title: '列出论据清单',
        description: '列出清单，包含每个假设的正反论据。',
        icon: '📄',
        color: 'purple'
    },
    {
        id: 3,
        title: '构建分析矩阵',
        description: '列出矩阵，横向的每行为假设H，纵向每列为证据E，分析证据的诊断性。',
        icon: '📊',
        color: 'pink'
    },
    {
        id: 4,
        title: '精简矩阵',
        description: '重新权衡，增删、合并、拆分假设，删除没有针对价值的证据。',
        icon: '🔍',
        color: 'orange'
    },
    {
        id: 5,
        title: '得出初步结论',
        description: '得出初步结论，尝试证伪，而非证明。',
        icon: '🎯',
        color: 'yellow'
    },
    {
        id: 6,
        title: '分析证据敏感性',
        description: '分析证据的敏感性。',
        icon: '📈',
        color: 'green'
    },
    {
        id: 7,
        title: '报告结论',
        description: '报告结论，讨论所有假设，而不是最可能的假设。',
        icon: '📋',
        color: 'teal'
    },
    {
        id: 8,
        title: '分析总结',
        description: '检查分析完整性、评估质量指标、生成分析洞察与总结报告。',
        icon: '📊',
        color: 'indigo'
    }
];

export const ACHAnalysis: React.FC = () => {
    const { ui, data, setCurrentStep } = useAnalysisStore();
    const { currentStep } = ui;

    const getStepStatus = (stepIndex: number) => {
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep) return 'current';
        return 'upcoming';
    };

    const getProgressPercentage = () => {
        return ((currentStep + 1) / STEPS.length) * 100;
    };

    const handleCompleteAnalysis = () => {
        // 完成分析，返回项目管理页面
        window.location.hash = '#/projects';
    };

    return (
        <div className="flex h-[calc(100vh-80px)]">
            {/* 左侧导航 */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="mb-3">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">分析进度</h2>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">步骤 {currentStep + 1} / {STEPS.length}</span>
                                <span className="text-blue-600 font-medium">{Math.round(getProgressPercentage())}%</span>
                            </div>
                            <Progress value={getProgressPercentage()} className="h-2" />
                        </div>
                    </div>

                    {/* 当前步骤信息 - 优化布局 */}
                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                步骤 {currentStep + 1}
                            </Badge>
                            <h3 className="font-medium text-gray-900">
                                {STEPS[currentStep].title}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* 步骤列表 */}
                <div className="flex-1 overflow-y-auto">
                    <StepNavigator
                        steps={STEPS}
                        currentStep={currentStep}
                        onStepChange={setCurrentStep}
                    />
                </div>
            </div>

            {/* 右侧内容区域 */}
            <div className="flex-1 flex flex-col">
                {/* 主要内容 */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <StepContent
                                    step={STEPS[currentStep]}
                                    stepIndex={currentStep}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* 底部操作区域 */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {currentStep > 0 && (
                                <button
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    上一步
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                                {currentStep + 1} / {STEPS.length}
                            </span>
                            <div className="flex space-x-1">
                                {STEPS.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full ${index === currentStep
                                            ? 'bg-blue-500'
                                            : index < currentStep
                                                ? 'bg-green-500'
                                                : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {currentStep < STEPS.length - 1 ? (
                                <button
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
                                >
                                    <span>下一步</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleCompleteAnalysis}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center space-x-2"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>完成分析</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 