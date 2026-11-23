<script lang="ts">
  import Text from "design-system/Text";
  import Theme from "design-system/Theme";

  let { message }: { message: string } = $props();
</script>

<Theme>
  <Text variant="error">{message}</Text>
</Theme>
