import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Pre-typed versions of the Redux hooks so components don't re-annotate types.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
