import * as React from 'react';
import { Button, Flex } from '@kushagradhawan/kookie-ui';

export default function SaveBar() {
  const [saving, setSaving] = React.useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  }

  return (
    <Flex gap="2" justify="end">
      <Button emphasis="quiet" color="gray" disabled={saving}>
        Cancel
      </Button>
      <Button emphasis="loud" loading={saving} onClick={save}>
        Save changes
      </Button>
    </Flex>
  );
}
