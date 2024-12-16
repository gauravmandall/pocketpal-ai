import {View, Animated} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {StyleProp, TextStyle, ViewStyle} from 'react-native';

import {Menu as PaperMenu, Icon} from 'react-native-paper';
import {MenuItemProps as PaperMenuItemProps} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {SubMenu} from '../SubMenu/SubMenu';

import {useTheme} from '../../../hooks';

import {createStyles} from './styles';

export interface MenuItemProps
  extends Omit<PaperMenuItemProps, 'title' | 'titleStyle'> {
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
  isGroupLabel?: boolean;
  icon?: IconSource;
  selected?: boolean;
  submenu?: React.ReactNode[];
  onSubmenuOpen?: () => void;
  onSubmenuClose?: () => void;
  selectable?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  danger,
  style,
  labelStyle,
  isGroupLabel,
  icon,
  selected,
  leadingIcon,
  trailingIcon,
  submenu,
  onSubmenuOpen,
  onSubmenuClose,
  selectable = false,
  ...menuItemProps
}) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState({x: 0, y: 0});
  const itemRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const theme = useTheme();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isSubmenuOpen ? 0.6 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, isSubmenuOpen]);

  const styles = createStyles(theme);

  const renderLeadingIcon = props => {
    if (!selectable && !leadingIcon) {
      return undefined;
    }

    return (
      <View
        style={[
          styles.leadingContainer,
          menuItemProps.disabled && styles.itemDisabled,
        ]}>
        {selected && <Icon testID="selected-icon" source="check" size={18} />}
        {leadingIcon &&
          (typeof leadingIcon === 'function' ? (
            leadingIcon({...props, size: 18})
          ) : (
            <Icon source={leadingIcon} size={18} />
          ))}
      </View>
    );
  };

  const renderTrailingIcon = props => (
    <View
      style={[
        styles.trailingContainer,
        menuItemProps.disabled && styles.itemDisabled,
      ]}>
      {trailingIcon ? (
        typeof trailingIcon === 'function' ? (
          trailingIcon({...props, size: 18})
        ) : (
          <Icon source={trailingIcon} size={18} />
        )
      ) : icon ? (
        <Icon source={icon} size={18} />
      ) : null}
    </View>
  );

  const renderSubmenuIcon = () => (
    <View style={styles.trailingContainer}>
      <Icon
        source={isSubmenuOpen ? 'chevron-down' : 'chevron-right'}
        size={18}
        color={theme.colors.menuText}
      />
    </View>
  );

  const handlePress = (e: any) => {
    if (submenu) {
      itemRef.current?.measure((x, y, width, height, pageX, pageY) => {
        const willOpen = !isSubmenuOpen;
        setSubmenuPosition({x: pageX + width, y: pageY + height});
        setIsSubmenuOpen(willOpen);
        if (willOpen) {
          onSubmenuOpen?.();
        } else {
          onSubmenuClose?.();
        }
      });
    } else {
      menuItemProps.onPress?.(e);
    }
  };

  return (
    <Animated.View ref={itemRef} style={{opacity: fadeAnim}}>
      <PaperMenu.Item
        {...menuItemProps}
        onPress={handlePress}
        disabled={isGroupLabel || menuItemProps.disabled}
        title={label}
        style={[
          styles.container,
          selectable || leadingIcon ? styles.containerWithLeading : null,
          isSubmenuOpen && styles.activeParent,
          isGroupLabel && styles.groupLabel,
          style,
        ]}
        dense
        contentStyle={styles.contentContainer}
        titleStyle={[
          styles.label,
          {
            color: danger ? theme.colors.menuDangerText : theme.colors.menuText,
          },
          menuItemProps.disabled && styles.labelDisabled,
          labelStyle,
        ]}
        {...(!selectable && !leadingIcon
          ? {}
          : {leadingIcon: renderLeadingIcon})}
        trailingIcon={submenu ? renderSubmenuIcon : renderTrailingIcon}
      />
      {submenu && (
        <SubMenu
          visible={isSubmenuOpen}
          onDismiss={() => {
            setIsSubmenuOpen(false);
            onSubmenuClose?.();
          }}
          anchorPosition={submenuPosition}>
          {submenu}
        </SubMenu>
      )}
    </Animated.View>
  );
};