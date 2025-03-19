import { createGlobalState } from '@vueuse/core';
import { readonly, ref, type Ref } from 'vue';

export interface UseSharedCounterReturn {
  counter: Readonly<Ref<number>>;
  increment: () => void;
  decrement: () => void;
}

export const useSharedCounter: () => UseSharedCounterReturn = createGlobalState(
  () => {
    const counter = ref<number>(0);

    function increment() {
      counter.value++;
    }

    function decrement() {
      counter.value--;
    }

    return {
      counter: readonly(counter),
      increment,
      decrement
    };
  }
);
