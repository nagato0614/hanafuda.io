import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { defineComponent, h, nextTick } from 'vue';

vi.mock('phaser', () => {
  class MockEventEmitter {
    on() {}
    emit() {}
    off() {}
  }

  return {
    default: {
      Events: { EventEmitter: MockEventEmitter }
    },
    Scene: class {},
    Events: { EventEmitter: MockEventEmitter }
  };
});

import App from '../src/App.vue';

const PhaserStub = defineComponent({
  emits: ['current-active-scene'],
  setup(_, { emit }) {
    const sceneObj: any = {
      scene: { key: 'MainMenu' },
      changeScene: () => {
        sceneObj.scene.key = 'Game';
        emit('current-active-scene', sceneObj);
      }
    };

    emit('current-active-scene', sceneObj);

    return () => h('div', { 'data-test': 'phaser-stub' });
  }
});

const CapturedStub = defineComponent({
  props: ['owner', 'categories'],
  setup(props) {
    return () => h('div', { 'data-test': `captured-${props.owner}` });
  }
});

const FieldStub = defineComponent({
  props: ['field', 'selectedCardId', 'selectableCardIds'],
  emits: ['select-card'],
  setup(props, { emit }) {
    return () =>
      h('button', {
        'data-test': 'field-stub',
        onClick: () => emit('select-card', props.field.cards?.[0])
      });
  }
});

describe('ルール表示モーダル', () => {
  it('対局開始後にルールボタンでモーダルが開く', async () => {
    setActivePinia(createPinia());

    const wrapper = mount(App, {
      global: {
        stubs: {
          PhaserGame: PhaserStub,
          CapturedArea: CapturedStub,
          FieldArea: FieldStub,
          HandArea: defineComponent({
            props: ['cards', 'selectableCardIds', 'selectedCardId'],
            setup(props, { emit }) {
              return () =>
                h(
                  'button',
                  {
                    'data-test': 'hand-stub',
                    onClick: () => emit('select-card', props.cards?.[0])
                  },
                  '手札'
                );
            }
          })
        }
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    await nextTick();

    const startButton = wrapper
      .findAll('button')
      .find((btn) => btn.text() === '対局を開始する');
    expect(startButton).toBeTruthy();
    await startButton!.trigger('click');

    await nextTick();

    const ruleButton = wrapper
      .findAll('button')
      .find((btn) => btn.text() === 'ルールを見る');
    expect(ruleButton).toBeTruthy();
    await ruleButton!.trigger('click');

    await nextTick();

    const modalHeading = wrapper.find('h2');
    expect(modalHeading.exists()).toBe(true);
    expect(modalHeading.text()).toBe('ルール');
  });
});
