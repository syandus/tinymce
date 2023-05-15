import { AlloyComponent, AlloySpec, Behaviour, Focusing, FocusInsideModes, Input, Keying, Memento } from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';
import { Focus, SugarElement, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';

export interface ToolbarTextButton {
  type: 'textbutton';
  tooltip: Optional<string>;
  icon: Optional<string>;
  text: Optional<string>;
  placeholder: Optional<string>;
  enabled: boolean;
  onSetup: (api: Toolbar.ToolbarButtonInstanceApi) => (api: Toolbar.ToolbarButtonInstanceApi) => void;
  onAction: (api: Toolbar.ToolbarButtonInstanceApi) => void;
}

const createBespokeTextInput = (_editor: Editor, _backstage: UiFactoryBackstage): AlloySpec => {
  const goToParent = (comp: AlloyComponent) =>
    Traverse.parentElement(comp.element).fold(Optional.none, (parent) => {
      Focus.focus(parent);
      return Optional.some(true);
    });

  const focusInput = (comp: AlloyComponent) => {
    if (Focus.hasFocus(comp.element)) {
      Traverse.firstChild(comp.element).each((input) => Focus.focus(input as SugarElement<HTMLElement>));
      return Optional.some(true);
    } else {
      return Optional.none();
    }
  };

  const memInput = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-input-wrapper', 'highlight-on-focus' ]
    },
    components: [
      Input.sketch({
        inputClasses: [ 'tox-textfield' ],
        tag: 'input'
      })
    ],
    behaviours: Behaviour.derive([
      Focusing.config({}),
      Keying.config({
        mode: 'special',
        onEnter: focusInput,
        onSpace: focusInput,
        onEscape: goToParent
      })
    ])
  });

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-text-input' ]
    },
    components: [
      memInput.asSpec()
    ],
    behaviours: Behaviour.derive([
      Focusing.config({}),
      Keying.config({
        mode: 'flow',
        focusInside: FocusInsideModes.OnEnterOrSpaceMode,
        cycles: false,
        selector: 'button, .tox-input-wrapper',
        onEscape: (wrapperComp) => {
          if (Focus.hasFocus(wrapperComp.element)) {
            return Optional.none();
          } else {
            Focus.focus(wrapperComp.element);
            return Optional.some(true);
          }
        },
      })
    ])
  };
};

export { createBespokeTextInput };
