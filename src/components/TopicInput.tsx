import React, { useState } from 'react';
import { useAnalysisStore } from '../store/analysisStore';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Lightbulb, Edit3, Save, X } from 'lucide-react';

export const TopicInput: React.FC = () => {
    const { data, updateTopic, updateTitle } = useAnalysisStore();
    const [isEditing, setIsEditing] = useState(false);
    const [tempTopic, setTempTopic] = useState(data.topic);
    const [tempTitle, setTempTitle] = useState(data.title);

    const handleSave = () => {
        updateTopic(tempTopic);
        updateTitle(tempTitle);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempTopic(data.topic);
        setTempTitle(data.title);
        setIsEditing(false);
    };

    const generateTitle = () => {
        if (tempTopic.trim()) {
            // 自动生成标题的简单逻辑
            const title = `${tempTopic.substring(0, 20)}${tempTopic.length > 20 ? '...' : ''} - ACH分析`;
            setTempTitle(title);
        }
    };

    return (
        <Card className="border-gray-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <span>分析项目</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
                {isEditing ? (
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                                项目标题
                            </Label>
                            <Input
                                id="title"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                placeholder="输入项目标题..."
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="topic" className="text-sm font-medium text-gray-700">
                                分析议题 *
                            </Label>
                            <textarea
                                id="topic"
                                value={tempTopic}
                                onChange={(e) => setTempTopic(e.target.value)}
                                placeholder="请输入需要分析的核心议题..."
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={generateTitle}
                                variant="outline"
                                size="sm"
                                disabled={!tempTopic.trim()}
                            >
                                自动生成标题
                            </Button>
                            <div className="flex-1" />
                            <Button
                                onClick={handleSave}
                                size="sm"
                                disabled={!tempTopic.trim()}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                保存
                            </Button>
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                size="sm"
                            >
                                <X className="h-4 w-4 mr-2" />
                                取消
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium text-gray-900">
                                {data.title || '新建分析项目'}
                            </h3>
                            <Button
                                onClick={() => setIsEditing(true)}
                                variant="outline"
                                size="sm"
                            >
                                <Edit3 className="h-4 w-4 mr-2" />
                                编辑
                            </Button>
                        </div>
                        <p className="text-sm text-gray-600">
                            {data.topic || '请设置分析议题'}
                        </p>
                        {!data.topic && (
                            <p className="text-xs text-red-500">
                                * 请先设置分析议题后再继续
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 