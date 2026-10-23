import * as React from 'react';
import { Box, Checkbox, Flex, Grid, RadioGroup, SegmentedControl, Select, Slider, Switch, Text, TextArea, TextField } from '@kushagradhawan/kookie-ui';
import { useScene, useVersion } from '../harness';

/** A long settings form: 40 groups of fields, every kind v1 has. */
export function FormScene() {
  const [version, rerender] = useVersion();
  const scroller = React.useRef<HTMLDivElement>(null);
  const api = React.useMemo(() => ({ rerender, scroller: () => scroller.current }), [rerender]);
  useScene(api);

  return (
    <Box ref={scroller} p="6" style={{ height: '100vh', overflow: 'auto' }}>
      <Grid columns="2" gap="6">
        {Array.from({ length: 40 }, (_, i) => (
          <Flex key={i} direction="column" gap="3">
            <Text as="label" weight="medium">
              Setting {i + version}
            </Text>
            <TextField.Root data-bench={i === 0 ? 'type' : undefined} placeholder={`Value ${i}`} />
            <TextArea placeholder="Notes" />
            <Select.Root defaultValue="a">
              <Select.Trigger aria-label={`Choice ${i}`} />
              <Select.Content>
                <Select.Item value="a">Alpha</Select.Item>
                <Select.Item value="b">Beta</Select.Item>
                <Select.Item value="c">Gamma</Select.Item>
              </Select.Content>
            </Select.Root>
            <Flex gap="4" align="center">
              <Checkbox aria-label={`Enable ${i}`} defaultChecked={(i + version) % 2 === 0} />
              <Switch aria-label={`Sync ${i}`} defaultChecked />
            </Flex>
            <RadioGroup.Root defaultValue="1" aria-label={`Mode ${i}`}>
              <RadioGroup.Item value="1">Daily</RadioGroup.Item>
              <RadioGroup.Item value="2">Weekly</RadioGroup.Item>
            </RadioGroup.Root>
            <SegmentedControl.Root defaultValue="l">
              <SegmentedControl.Item value="l">Left</SegmentedControl.Item>
              <SegmentedControl.Item value="r">Right</SegmentedControl.Item>
            </SegmentedControl.Root>
            <Slider defaultValue={[(i * 5 + version) % 100]} aria-label={`Level ${i}`} />
          </Flex>
        ))}
      </Grid>
    </Box>
  );
}
