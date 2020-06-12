import * as pulumi from "@pulumi/pulumi";

export interface FooOptions {
    bar: pulumi.Input<string>;
    baz: pulumi.Input<string>;
}

interface DynamicProviderInputs {
    bar: string;
    baz: string;
}

interface DynamicProviderOutputs extends DynamicProviderInputs {
    name: string;
}

class FooResourceProvider implements pulumi.dynamic.ResourceProvider {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    async check(olds: DynamicProviderInputs, news: DynamicProviderInputs): Promise<pulumi.dynamic.CheckResult> {
        if (olds.bar === news.bar && olds.baz === news.baz) {
            return { inputs: news };
        }

        const failures: pulumi.dynamic.CheckFailure[] = [];
        if (!news.bar) {
            failures.push({
                property: "bar",
                reason: "bar is required",
            });
        }
        if (!news.baz) {
            failures.push({
                property: "baz",
                reason: "baz is required",
            });
        }

        if (failures.length > 0) {
            return { failures: failures };
        }

        return { inputs: news };
    }

    async diff(id: string, previousOutput: DynamicProviderOutputs, news: DynamicProviderInputs): Promise<pulumi.dynamic.DiffResult> {
        const replaces: string[] = [];
        let changes = false;
        const deleteBeforeReplace = false;
        const stables: string[] = [];

        if (previousOutput.bar !== news.bar) {
            changes = true;
        }

        if (previousOutput.baz !== news.baz) {
            changes = true;
        }

        return {
            deleteBeforeReplace: deleteBeforeReplace,
            replaces: replaces,
            changes: changes,
            stables: stables
        };
    }

    async create(inputs: DynamicProviderInputs): Promise<pulumi.dynamic.CreateResult> {

        // Create logic goes here

        const outs: DynamicProviderOutputs = {
            name: this.name,
            bar: inputs.bar,
            baz: inputs.baz,
        };

        return {
            id: outs.name,
            outs
        };
    }

    async read(id: string, props: DynamicProviderOutputs): Promise<pulumi.dynamic.ReadResult> {

        // Read logic goes here

        return {
            id: props.name,
            props
        };
    }

    async delete(id: string, props: DynamicProviderOutputs): Promise<void> {
        // Delete logic goes here
    }

    async update(id: string, currentOutputs: DynamicProviderOutputs, newInputs: DynamicProviderInputs): Promise<pulumi.dynamic.UpdateResult> {

        // Update logic goes here

        console.log('PROVIDER UPDATED');

        return { outs: newInputs };
    }
}

export class FooResource extends pulumi.dynamic.Resource {
    public readonly bar!: pulumi.Output<string>;
    public readonly baz!: pulumi.Output<string>;

    constructor(name: string, args: FooOptions, opts?: pulumi.CustomResourceOptions) {
        super(new FooResourceProvider(name), `Foo:${name}`, args, opts);
    }
}
