# Developer documentation

This uses a pattern of facade components. The `<MarkersProvider />` from `markers-context.tsx` provides a central registry of markers.

The marker components inside the `/fascade` folder are exported and available to consumers of this library. However they don't implement business functionatlity. They only provide the means and necessary data to register a marker of this type to the registry.

All behaviour / business logic is implemented in the components in the `/implementations` folder.
