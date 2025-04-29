import { create } from 'zustand';

type LoadingState = {
    loadingRows: Record<string, boolean>;
    setRowLoading: (rowId: string, isLoading: boolean) => void;
    isRowLoading: (rowId: string) => boolean;
};

export const useLoadingStore = create<LoadingState>((set, get) => ({
    loadingRows: {},
    setRowLoading: (rowId, isLoading) =>
        set((state) => ({
            loadingRows: {
                ...state.loadingRows,
                [rowId]: isLoading
            }
        })),
    isRowLoading: (rowId) => get().loadingRows[rowId] || false,
}));