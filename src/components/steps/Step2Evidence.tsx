import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit3, Save, X, FileText, ThumbsUp, ThumbsDown, Minus, Link, BarChart3, Lightbulb } from 'lucide-react';
import { useAnalysisStore } from '../../store/analysisStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import type { EvidenceType } from '../../types';

// 可拖拽滑块组件
interface DraggableSliderProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    label?: string;
}

const DraggableSlider: React.FC<DraggableSliderProps> = ({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    className = '',
    label
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    const calculateValue = (clientX: number) => {
        if (!sliderRef.current) return value;

        const rect = sliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const percentage = (x / rect.width) * 100;
        const newValue = Math.round((percentage / 100) * (max - min) + min);
        return Math.max(min, Math.min(max, Math.round(newValue / step) * step));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);

        // 立即更新值
        const newValue = calculateValue(e.clientX);
        onChange(newValue);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newValue = calculateValue(moveEvent.clientX);
            onChange(newValue);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTrackClick = (e: React.MouseEvent) => {
        // 如果点击的是手柄，不处理
        if ((e.target as HTMLElement).closest('.slider-handle')) return;

        const newValue = calculateValue(e.clientX);
        onChange(newValue);
    };

    const progressValue = ((value - min) / (max - min)) * 100;

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <Label className="text-xs font-medium text-gray-700 flex items-center justify-between">
                    <span>{label}</span>
                    <span className="text-blue-600 font-semibold">{value}%</span>
                </Label>
            )}
            <div
                ref={sliderRef}
                className="slider-container relative h-3 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={handleTrackClick}
            >
                {/* 进度条背景 */}
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-150"
                    style={{ width: `${progressValue}%` }}
                />

                {/* 拖拽手柄 */}
                <div
                    className={`slider-handle absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-grab transition-all duration-150 ${isDragging ? 'scale-110 shadow-lg cursor-grabbing border-blue-600' : 'hover:scale-105 hover:shadow-lg'
                        }`}
                    style={{ left: `calc(${progressValue}% - 10px)` }}
                    onMouseDown={handleMouseDown}
                >
                    <div className="absolute inset-1 bg-blue-500 rounded-full opacity-50" />
                </div>

                {/* 刻度线（可选） */}
                <div className="absolute top-0 left-0 w-full h-full flex items-center pointer-events-none">
                    {[0, 25, 50, 75, 100].map((tick) => (
                        <div
                            key={tick}
                            className="absolute w-0.5 h-2 bg-gray-400 opacity-30"
                            style={{ left: `${tick}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* 数值输入框 */}
            <div className="flex items-center space-x-2 mt-1">
                <Input
                    type="number"
                    value={value}
                    onChange={(e) => {
                        const newValue = Math.max(min, Math.min(max, parseInt(e.target.value) || 0));
                        onChange(newValue);
                    }}
                    min={min}
                    max={max}
                    step={step}
                    className="w-16 h-6 text-xs text-center"
                />
                <span className="text-xs text-gray-500">%</span>
            </div>
        </div>
    );
};

interface EvidenceFormData {
    text: string;
    type: EvidenceType;
    source: string;
    weight: number;
    reliability: number;
    notes: string;
}

const initialFormData: EvidenceFormData = {
    text: '',
    type: 'supporting',
    source: '',
    weight: 50,
    reliability: 50,
    notes: ''
};

export const Step2Evidence: React.FC = () => {
    const { data, addEvidence, updateEvidence, deleteEvidence } = useAnalysisStore();
    const [formData, setFormData] = useState<EvidenceFormData>(initialFormData);
    const [editingEvidence, setEditingEvidence] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<EvidenceFormData>(initialFormData);
    const [selectedType, setSelectedType] = useState<EvidenceType | 'all'>('all');
    const [isAddingEvidence, setIsAddingEvidence] = useState(false);

    const getTypeConfig = (type: EvidenceType) => {
        switch (type) {
            case 'supporting':
                return {
                    label: '支持',
                    icon: <ThumbsUp className="w-3 h-3" />,
                    color: 'bg-green-100 text-green-800 border-green-200',
                    borderColor: 'border-green-200'
                };
            case 'opposing':
                return {
                    label: '反对',
                    icon: <ThumbsDown className="w-3 h-3" />,
                    color: 'bg-red-100 text-red-800 border-red-200',
                    borderColor: 'border-red-200'
                };
            case 'neutral':
                return {
                    label: '中性',
                    icon: <Minus className="w-3 h-3" />,
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    borderColor: 'border-gray-200'
                };
            default:
                return {
                    label: '未知',
                    icon: <FileText className="w-3 h-3" />,
                    color: 'bg-gray-100 text-gray-600 border-gray-200',
                    borderColor: 'border-gray-200'
                };
        }
    };

    const updateFormData = (field: keyof EvidenceFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateEditFormData = (field: keyof EvidenceFormData, value: any) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddEvidence = () => {
        if (formData.text.trim()) {
            addEvidence({
                text: formData.text.trim(),
                type: formData.type,
                source: formData.source.trim(),
                weight: formData.weight,
                reliability: formData.reliability,
                notes: formData.notes.trim(),
            });
            setFormData(initialFormData);
            setIsAddingEvidence(false);
        }
    };

    const startEdit = (evidenceId: string) => {
        const evidence = data.evidence.find(e => e.id === evidenceId);
        if (evidence) {
            setEditingEvidence(evidenceId);
            setEditFormData({
                text: evidence.text,
                type: evidence.type,
                source: evidence.source,
                weight: evidence.weight,
                reliability: evidence.reliability,
                notes: evidence.notes,
            });
        }
    };

    const saveEdit = () => {
        if (editingEvidence && editFormData.text.trim()) {
            updateEvidence(editingEvidence, {
                text: editFormData.text.trim(),
                type: editFormData.type,
                source: editFormData.source.trim(),
                weight: editFormData.weight,
                reliability: editFormData.reliability,
                notes: editFormData.notes.trim(),
            });
            setEditingEvidence(null);
            setEditFormData(initialFormData);
        }
    };

    const cancelEdit = () => {
        setEditingEvidence(null);
        setEditFormData(initialFormData);
    };

    const filteredEvidence = useMemo(() => {
        if (selectedType === 'all') {
            return data.evidence;
        }
        return data.evidence.filter(e => e.type === selectedType);
    }, [data.evidence, selectedType]);

    const stats = useMemo(() => {
        const supporting = data.evidence.filter(e => e.type === 'supporting').length;
        const opposing = data.evidence.filter(e => e.type === 'opposing').length;
        const neutral = data.evidence.filter(e => e.type === 'neutral').length;
        const total = data.evidence.length;

        const avgWeight = total > 0 ? Math.round(data.evidence.reduce((sum, e) => sum + e.weight, 0) / total) : 0;
        const avgReliability = total > 0 ? Math.round(data.evidence.reduce((sum, e) => sum + e.reliability, 0) / total) : 0;

        return { supporting, opposing, neutral, total, avgWeight, avgReliability };
    }, [data.evidence]);

    return (
        <div className="space-y-4">
            {/* 提示信息 */}
            <Alert className="border-blue-200 bg-blue-50">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>证据收集指南：</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>• 收集支持和反对每个假设的证据</li>
                        <li>• 评估每个证据的权重和可靠性</li>
                        <li>• 记录证据来源以便后续验证</li>
                        <li>• 尽量保持证据的平衡性和多样性</li>
                    </ul>
                </AlertDescription>
            </Alert>

            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">支持证据</p>
                                <p className="text-2xl font-bold text-green-600">{stats.supporting}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <ThumbsUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">反对证据</p>
                                <p className="text-2xl font-bold text-red-600">{stats.opposing}</p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <ThumbsDown className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">中性证据</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.neutral}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-full">
                                <Minus className="h-6 w-6 text-gray-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">总计</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 证据列表区域 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">证据列表</h3>
                </div>
                <Dialog open={isAddingEvidence} onOpenChange={setIsAddingEvidence}>
                    <DialogTrigger asChild>
                        <Button className="shadow-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            添加证据
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>添加新证据</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Label htmlFor="evidence-text" className="text-sm font-medium">证据内容 *</Label>
                                    <textarea
                                        id="evidence-text"
                                        value={formData.text}
                                        onChange={(e) => updateFormData('text', e.target.value)}
                                        placeholder="描述证据内容..."
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={3}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="evidence-source" className="text-sm font-medium">证据来源</Label>
                                    <Input
                                        id="evidence-source"
                                        value={formData.source}
                                        onChange={(e) => updateFormData('source', e.target.value)}
                                        placeholder="例如：新闻报道、官方文件、专家访谈等"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="evidence-type" className="text-sm font-medium">证据类型</Label>
                                    <Select value={formData.type} onValueChange={(value: EvidenceType) => updateFormData('type', value)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="supporting">支持证据</SelectItem>
                                            <SelectItem value="opposing">反对证据</SelectItem>
                                            <SelectItem value="neutral">中性证据</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <DraggableSlider
                                        value={formData.weight}
                                        onChange={(value) => updateFormData('weight', value)}
                                        min={0}
                                        max={100}
                                        step={1}
                                        label="权重"
                                    />
                                </div>
                                <div>
                                    <DraggableSlider
                                        value={formData.reliability}
                                        onChange={(value) => updateFormData('reliability', value)}
                                        min={0}
                                        max={100}
                                        step={1}
                                        label="可靠性"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="evidence-notes" className="text-sm font-medium">备注</Label>
                                <textarea
                                    id="evidence-notes"
                                    value={formData.notes}
                                    onChange={(e) => updateFormData('notes', e.target.value)}
                                    placeholder="额外的注释或说明..."
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    onClick={handleAddEvidence}
                                    disabled={!formData.text.trim()}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    添加证据
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingEvidence(false);
                                        setFormData(initialFormData);
                                    }}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    取消
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* 筛选器 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <Label className="text-sm">筛选类型：</Label>
                    <Select value={selectedType} onValueChange={(value: EvidenceType | 'all') => setSelectedType(value)}>
                        <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部</SelectItem>
                            <SelectItem value="supporting">支持</SelectItem>
                            <SelectItem value="opposing">反对</SelectItem>
                            <SelectItem value="neutral">中性</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-sm text-gray-500">
                    共 {filteredEvidence.length} 条证据
                </div>
            </div>

            {/* 证据列表 - 多列式排列 */}
            {filteredEvidence.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {filteredEvidence.map((evidence, index) => {
                            const typeConfig = getTypeConfig(evidence.type);
                            return (
                                <motion.div
                                    key={evidence.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className={`hover:shadow-sm transition-shadow h-full ${typeConfig.borderColor}`}>
                                        <CardContent className="p-4">
                                            <div className="flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                                                            E{index + 1}
                                                        </Badge>
                                                        <Badge className={`${typeConfig.color} text-xs`}>
                                                            {typeConfig.icon}
                                                            <span className="ml-1">{typeConfig.label}</span>
                                                        </Badge>
                                                    </div>
                                                    <div className="flex space-x-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => startEdit(evidence.id)}
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <Edit3 className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => deleteEvidence(evidence.id)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {editingEvidence === evidence.id ? (
                                                    <div className="space-y-3 flex-1">
                                                        <div>
                                                            <Label className="text-sm">证据内容</Label>
                                                            <textarea
                                                                value={editFormData.text}
                                                                onChange={(e) => updateEditFormData('text', e.target.value)}
                                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                                                                rows={3}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm">来源</Label>
                                                            <Input
                                                                value={editFormData.source}
                                                                onChange={(e) => updateEditFormData('source', e.target.value)}
                                                                className="mt-1 text-sm"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <DraggableSlider
                                                                    value={editFormData.weight}
                                                                    onChange={(value) => updateEditFormData('weight', value)}
                                                                    min={0}
                                                                    max={100}
                                                                    step={1}
                                                                    label="权重"
                                                                />
                                                            </div>
                                                            <div>
                                                                <DraggableSlider
                                                                    value={editFormData.reliability}
                                                                    onChange={(value) => updateEditFormData('reliability', value)}
                                                                    min={0}
                                                                    max={100}
                                                                    step={1}
                                                                    label="可靠性"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Button size="sm" onClick={saveEdit} className="text-xs">
                                                                <Save className="w-3 h-3 mr-1" />
                                                                保存
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={cancelEdit} className="text-xs">
                                                                <X className="w-3 h-3 mr-1" />
                                                                取消
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3 flex-1">
                                                        <p className="text-gray-900 leading-relaxed text-sm line-clamp-3">{evidence.text}</p>

                                                        {evidence.source && (
                                                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                                                <Link className="w-3 h-3" />
                                                                <span>来源: {evidence.source}</span>
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <Label className="text-xs font-medium text-gray-700">权重: {evidence.weight}%</Label>
                                                                <Progress value={evidence.weight} className="h-1.5 mt-1" />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs font-medium text-gray-700">可靠性: {evidence.reliability}%</Label>
                                                                <Progress value={evidence.reliability} className="h-1.5 mt-1" />
                                                            </div>
                                                        </div>

                                                        {evidence.notes && (
                                                            <div className="bg-gray-50 p-2 rounded-md">
                                                                <p className="text-xs text-gray-700">{evidence.notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                /* 空状态 */
                <Card className="border-dashed border-gray-300">
                    <CardContent className="p-8">
                        <div className="text-center text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg mb-2">
                                {selectedType === 'all' ? '还没有添加证据' : `没有${getTypeConfig(selectedType as EvidenceType).label}证据`}
                            </p>
                            <p className="text-sm">
                                {selectedType === 'all' ? '点击右上角的"添加证据"按钮开始添加证据' : '可以切换到其他类型查看，或点击右上角按钮添加新证据'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 进度指示器 */}
            {data.evidence.length > 0 && (
                <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">
                                    已添加 {data.evidence.length} 条证据
                                    {data.evidence.length >= 5 ? ' - 可以进入下一步' : ' - 建议至少添加5条证据'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-green-700">
                                <span>平均权重: {stats.avgWeight}%</span>
                                <span>平均可靠性: {stats.avgReliability}%</span>
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}; 