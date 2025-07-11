import React, { useState } from 'react';
import { Settings, Palette, Globe, Bell, Lock, Download, Upload, FileText, Save, RefreshCw, Sun, Moon, Monitor, Shield, Database, Trash2, CheckCircle } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

export const SettingsPage: React.FC = () => {
    const { preferences, updatePreferences } = useAnalysisStore();
    const [showSaveNotification, setShowSaveNotification] = useState(false);

    const handleSave = () => {
        setShowSaveNotification(true);
        setTimeout(() => setShowSaveNotification(false), 3000);
    };

    const exportSettings = () => {
        const settingsData = {
            preferences,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };

        const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ach-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target?.result as string);
                    if (importedData.preferences) {
                        updatePreferences(importedData.preferences);
                        alert('设置导入成功！');
                    }
                } catch (error) {
                    alert('设置文件格式错误，导入失败！');
                }
            };
            reader.readAsText(file);
        }
    };

    const resetSettings = () => {
        if (confirm('确定要重置所有设置为默认值吗？此操作不可撤销。')) {
            updatePreferences({
                theme: { mode: 'light', fontSize: 'medium' },
                language: 'zh',
                autoSave: true,
                saveInterval: 5,
                showTooltips: true,
                compactMode: false,
                keyboardShortcuts: true
            });
            alert('设置已重置为默认值！');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Settings className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
                        <p className="text-gray-600 mt-1">个性化您的ACH分析工具体验</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={resetSettings}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        重置设置
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        保存设置
                    </Button>
                </div>
            </div>

            {/* 保存通知 */}
            {showSaveNotification && (
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        设置已保存成功！
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧主要设置 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 外观设置 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center space-x-2">
                                <Palette className="h-6 w-6 text-purple-600" />
                                <span>外观设置</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">主题模式</Label>
                                        <Select
                                            value={preferences.theme.mode}
                                            onValueChange={(value) => updatePreferences({
                                                theme: { ...preferences.theme, mode: value as 'light' | 'dark' | 'auto' }
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="light">
                                                    <div className="flex items-center space-x-2">
                                                        <Sun className="h-4 w-4" />
                                                        <span>浅色模式</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="dark">
                                                    <div className="flex items-center space-x-2">
                                                        <Moon className="h-4 w-4" />
                                                        <span>深色模式</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="auto">
                                                    <div className="flex items-center space-x-2">
                                                        <Monitor className="h-4 w-4" />
                                                        <span>跟随系统</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 mt-1">选择您偏好的界面主题</p>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">字体大小</Label>
                                        <Select
                                            value={preferences.theme.fontSize}
                                            onValueChange={(value) => updatePreferences({
                                                theme: { ...preferences.theme, fontSize: value as 'small' | 'medium' | 'large' }
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="small">小号字体</SelectItem>
                                                <SelectItem value="medium">标准字体</SelectItem>
                                                <SelectItem value="large">大号字体</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 mt-1">调整界面文字大小</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">界面密度</Label>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={preferences.compactMode}
                                                        onChange={(e) => updatePreferences({ compactMode: e.target.checked })}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <Label className="text-sm">紧凑模式</Label>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {preferences.compactMode ? '已启用' : '已禁用'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">减少界面元素间距，显示更多内容</p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">工具提示</Label>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={preferences.showTooltips}
                                                        onChange={(e) => updatePreferences({ showTooltips: e.target.checked })}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <Label className="text-sm">显示提示信息</Label>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {preferences.showTooltips ? '已启用' : '已禁用'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">鼠标悬停时显示操作提示</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 系统设置 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center space-x-2">
                                <Globe className="h-6 w-6 text-green-600" />
                                <span>系统设置</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">语言设置</Label>
                                        <Select
                                            value={preferences.language}
                                            onValueChange={(value) => updatePreferences({ language: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="zh">简体中文</SelectItem>
                                                <SelectItem value="zh-TW">繁體中文</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="ja">日本語</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500 mt-1">选择界面显示语言</p>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                            自动保存间隔（分钟）
                                        </Label>
                                        <Input
                                            type="number"
                                            value={preferences.saveInterval}
                                            onChange={(e) => updatePreferences({ saveInterval: parseInt(e.target.value) || 5 })}
                                            min="1"
                                            max="60"
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">设置数据自动保存的时间间隔</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">功能开关</Label>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={preferences.autoSave}
                                                        onChange={(e) => updatePreferences({ autoSave: e.target.checked })}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <Label className="text-sm">自动保存</Label>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {preferences.autoSave ? '已启用' : '已禁用'}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={preferences.keyboardShortcuts}
                                                        onChange={(e) => updatePreferences({ keyboardShortcuts: e.target.checked })}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <Label className="text-sm">键盘快捷键</Label>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {preferences.keyboardShortcuts ? '已启用' : '已禁用'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 数据管理 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center space-x-2">
                                <Database className="h-6 w-6 text-blue-600" />
                                <span>数据管理</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">备份与恢复</h4>
                                    <div className="space-y-3">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={exportSettings}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            导出设置
                                        </Button>
                                        <div>
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={importSettings}
                                                className="hidden"
                                                id="import-settings"
                                            />
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => document.getElementById('import-settings')?.click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                导入设置
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">存储空间</h4>
                                    <div className="space-y-3">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">已使用空间</span>
                                                <span className="font-medium">1.2 MB</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm mt-1">
                                                <span className="text-gray-600">可用空间</span>
                                                <span className="font-medium">8.8 MB</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            清理缓存
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Alert className="border-blue-200 bg-blue-50">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    <strong>数据存储说明：</strong>
                                    <p className="mt-2 text-sm">
                                        系统自动将设置和分析数据保存到浏览器本地存储，无需担心数据丢失。
                                        建议定期导出重要项目数据进行备份。
                                    </p>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>

                {/* 右侧信息面板 */}
                <div className="space-y-6">
                    {/* 系统信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                                <Shield className="h-5 w-5 text-green-600" />
                                <span>系统信息</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">版本</span>
                                    <Badge variant="outline">v2.0.0</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">构建时间</span>
                                    <span className="text-gray-900">2024-01-15</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">浏览器</span>
                                    <span className="text-gray-900">Chrome 120+</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">平台</span>
                                    <span className="text-gray-900">Web</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <h5 className="font-medium text-gray-900">更新日志</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• 新增项目管理功能</li>
                                    <li>• 优化界面布局和响应式设计</li>
                                    <li>• 增强矩阵分析功能</li>
                                    <li>• 修复已知问题</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 隐私安全 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                                <Lock className="h-5 w-5 text-orange-600" />
                                <span>隐私安全</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">数据加密</span>
                                    <Badge className="bg-green-100 text-green-800">已启用</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">本地存储</span>
                                    <Badge className="bg-blue-100 text-blue-800">安全</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">数据上传</span>
                                    <Badge className="bg-gray-100 text-gray-800">禁用</Badge>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <h5 className="font-medium text-gray-900">隐私保护</h5>
                                <p className="text-xs text-gray-600">
                                    所有分析数据均保存在您的本地浏览器中，
                                    我们不会收集或上传任何个人信息。
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 通知设置 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                                <Bell className="h-5 w-5 text-purple-600" />
                                <span>通知设置</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">保存成功通知</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">错误提醒</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">功能提示</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 快速操作 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">快速操作</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <Download className="h-4 w-4 mr-2" />
                                导出所有数据
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                重新加载应用
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                清空所有数据
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}; 