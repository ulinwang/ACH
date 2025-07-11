// 本地存储工具函数
import { AnalysisData, UserPreferences, DEFAULT_USER_PREFERENCES } from '@/types';

// 存储键名
const STORAGE_KEYS = {
    ANALYSIS_DATA: 'ach-analysis-data',
    USER_PREFERENCES: 'ach-user-preferences',
    OPERATION_HISTORY: 'ach-operation-history',
    AUTO_SAVE: 'ach-auto-save',
} as const;

// 通用存储函数
export const storage = {
    // 获取数据
    get: <T>(key: string, defaultValue?: T): T | null => {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue || null;
            return JSON.parse(item, (key, value) => {
                // 自动转换日期字符串为Date对象
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                    return new Date(value);
                }
                return value;
            });
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue || null;
        }
    },

    // 设置数据
    set: <T>(key: string, value: T): boolean => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    // 删除数据
    remove: (key: string): boolean => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // 清空所有数据
    clear: (): boolean => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // 获取存储大小
    getSize: (): number => {
        try {
            let total = 0;
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return total;
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return 0;
        }
    },

    // 检查存储是否可用
    isAvailable: (): boolean => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    },
};

// 分析数据存储
export const analysisStorage = {
    // 保存分析数据
    save: (data: AnalysisData): boolean => {
        const dataWithTimestamp = {
            ...data,
            metadata: {
                ...data.metadata,
                updatedAt: new Date(),
            },
        };
        return storage.set(STORAGE_KEYS.ANALYSIS_DATA, dataWithTimestamp);
    },

    // 加载分析数据
    load: (): AnalysisData | null => {
        return storage.get<AnalysisData>(STORAGE_KEYS.ANALYSIS_DATA);
    },

    // 创建新分析
    create: (topic: string, title?: string): AnalysisData => {
        const now = new Date();
        const newData: AnalysisData = {
            id: generateId(),
            title: title || `ACH分析 - ${topic}`,
            topic,
            hypotheses: [],
            evidence: [],
            matrix: {},
            conclusions: [],
            sensitivity: [],
            milestones: [],
            report: {
                id: generateId(),
                title: `${topic} - 分析报告`,
                sections: {
                    summary: createReportSection('摘要', ''),
                    hypotheses: createReportSection('假设分析', ''),
                    evidence: createReportSection('证据评估', ''),
                    analysis: createReportSection('矩阵分析', ''),
                    conclusions: createReportSection('结论', ''),
                    recommendations: createReportSection('建议', ''),
                },
                createdAt: now,
                updatedAt: now,
            },
            metadata: {
                version: '1.0.0',
                createdAt: now,
                updatedAt: now,
            },
        };
        return newData;
    },

    // 导出数据
    export: (data: AnalysisData): string => {
        return JSON.stringify(data, null, 2);
    },

    // 导入数据
    import: (jsonString: string): AnalysisData | null => {
        try {
            const data = JSON.parse(jsonString, (key, value) => {
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                    return new Date(value);
                }
                return value;
            });

            // 验证数据结构
            if (!data.id || !data.topic || !Array.isArray(data.hypotheses) || !Array.isArray(data.evidence)) {
                throw new Error('Invalid data structure');
            }

            return data;
        } catch (error) {
            console.error('Error importing data:', error);
            return null;
        }
    },

    // 清空数据
    clear: (): boolean => {
        return storage.remove(STORAGE_KEYS.ANALYSIS_DATA);
    },
};

// 用户偏好存储
export const preferencesStorage = {
    // 保存用户偏好
    save: (preferences: UserPreferences): boolean => {
        return storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
    },

    // 加载用户偏好
    load: (): UserPreferences => {
        return storage.get(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_USER_PREFERENCES) || DEFAULT_USER_PREFERENCES;
    },

    // 更新特定偏好
    update: (updates: Partial<UserPreferences>): boolean => {
        const current = preferencesStorage.load();
        const updated = { ...current, ...updates };
        return preferencesStorage.save(updated);
    },

    // 重置为默认值
    reset: (): boolean => {
        return storage.remove(STORAGE_KEYS.USER_PREFERENCES);
    },
};

// 自动保存
export const autoSave = {
    // 自动保存数据
    save: (data: AnalysisData): boolean => {
        const autoSaveData = {
            ...data,
            metadata: {
                ...data.metadata,
                updatedAt: new Date(),
            },
        };
        return storage.set(STORAGE_KEYS.AUTO_SAVE, autoSaveData);
    },

    // 加载自动保存数据
    load: (): AnalysisData | null => {
        return storage.get<AnalysisData>(STORAGE_KEYS.AUTO_SAVE);
    },

    // 清空自动保存
    clear: (): boolean => {
        return storage.remove(STORAGE_KEYS.AUTO_SAVE);
    },

    // 检查是否有自动保存数据
    hasData: (): boolean => {
        return storage.get(STORAGE_KEYS.AUTO_SAVE) !== null;
    },
};

// 操作历史存储
export const historyStorage = {
    // 保存操作历史
    save: (history: any[]): boolean => {
        // 只保留最近100条记录
        const limitedHistory = history.slice(-100);
        return storage.set(STORAGE_KEYS.OPERATION_HISTORY, limitedHistory);
    },

    // 加载操作历史
    load: (): any[] => {
        return storage.get(STORAGE_KEYS.OPERATION_HISTORY, []) || [];
    },

    // 添加操作记录
    add: (operation: any): boolean => {
        const history = historyStorage.load();
        history.push({
            ...operation,
            timestamp: new Date(),
        });
        return historyStorage.save(history);
    },

    // 清空历史
    clear: (): boolean => {
        return storage.remove(STORAGE_KEYS.OPERATION_HISTORY);
    },
};

// 工具函数
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createReportSection(title: string, content: string): any {
    return {
        id: generateId(),
        title,
        content,
        isAutoGenerated: false,
        lastUpdated: new Date(),
    };
}

// 数据验证
export function validateAnalysisData(data: any): boolean {
    try {
        return !!(
            data &&
            typeof data.id === 'string' &&
            typeof data.topic === 'string' &&
            Array.isArray(data.hypotheses) &&
            Array.isArray(data.evidence) &&
            typeof data.matrix === 'object'
        );
    } catch (error) {
        return false;
    }
}

// 数据迁移
export function migrateData(data: any): AnalysisData | null {
    try {
        // 如果数据已经是最新版本，直接返回
        if (data.metadata && data.metadata.version === '1.0.0') {
            return data;
        }

        // 处理旧版本数据迁移
        const now = new Date();
        const migrated: AnalysisData = {
            id: data.id || generateId(),
            title: data.title || `ACH分析 - ${data.topic || '未命名'}`,
            topic: data.topic || '未命名议题',
            hypotheses: data.hypotheses || [],
            evidence: data.evidence || [],
            matrix: data.matrix || {},
            conclusions: data.conclusions || [],
            sensitivity: data.sensitivity || [],
            milestones: data.milestones || [],
            report: data.report || {
                id: generateId(),
                title: `${data.topic || '未命名'} - 分析报告`,
                sections: {
                    summary: createReportSection('摘要', ''),
                    hypotheses: createReportSection('假设分析', ''),
                    evidence: createReportSection('证据评估', ''),
                    analysis: createReportSection('矩阵分析', ''),
                    conclusions: createReportSection('结论', ''),
                    recommendations: createReportSection('建议', ''),
                },
                createdAt: now,
                updatedAt: now,
            },
            metadata: {
                version: '1.0.0',
                createdAt: data.metadata?.createdAt || now,
                updatedAt: now,
            },
        };

        return migrated;
    } catch (error) {
        console.error('Error migrating data:', error);
        return null;
    }
}

// 存储配额检查
export function checkStorageQuota(): { used: number; total: number; available: number } {
    const used = storage.getSize();
    const total = 5 * 1024 * 1024; // 5MB (typical localStorage limit)
    const available = total - used;

    return { used, total, available };
}

// 清理过期数据
export function cleanupExpiredData(): boolean {
    try {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 清理过期的自动保存数据
        const autoSaveData = autoSave.load();
        if (autoSaveData && autoSaveData.metadata.updatedAt < oneWeekAgo) {
            autoSave.clear();
        }

        // 清理过期的操作历史
        const history = historyStorage.load();
        const recentHistory = history.filter((item: any) =>
            item.timestamp && new Date(item.timestamp) > oneWeekAgo
        );
        if (recentHistory.length !== history.length) {
            historyStorage.save(recentHistory);
        }

        return true;
    } catch (error) {
        console.error('Error cleaning up expired data:', error);
        return false;
    }
} 